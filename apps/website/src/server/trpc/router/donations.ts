import { TRPCError } from "@trpc/server";
import { waitUntil } from "@vercel/functions";
import type { NextApiRequest } from "next";
import pluralize from "pluralize";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import {
  DonationSchema,
  type Pixel,
  PixelSchema,
  type Providers,
} from "@alveusgg/donations-core";

import { env } from "@/env";

import { getNeonLogoutUrl, getNeonOAuthConfig } from "@/server/apis/neon";
import { sendChatMessage } from "@/server/apis/twitch";
import { decryptAccountTokens } from "@/server/db/account-tokens";
import {
  type PixelWithDonation,
  createDonations,
  createPixels,
  getDonationFeed,
  getExternalPixelsByVerification,
  getMyPixels,
  getNeonPixels,
  getPixels,
  removeDonations,
  renamePixel,
} from "@/server/db/donations";
import { triggerPlainDiscordChannelWebhook } from "@/server/outgoing-webhooks";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  publicProcedure,
  router,
  sharedKeyProcedure,
} from "@/server/trpc/trpc";
import {
  NEON_DONOR_SESSION_COOKIE,
  getNeonDonorSession,
} from "@/server/utils/neon-donor-session";
import { getClientIp, limit } from "@/server/utils/rate-limit";

import murals, { type MuralId, isMuralId } from "@/data/murals";
import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import { getShortBaseUrl } from "@/utils/short-url";

import { externalVerificationSchema } from "@/components/institute/EditExternalPixels";
import { pixelIdentifierSchema } from "@/components/institute/PixelIdentifierInput";
import { coordsToGridRef } from "@/components/institute/Pixels";

const DONATION_FEED_ENTRIES_PER_PAGE = 50;

function isPixelLocked(pixel: { renamedAt: Date | null }) {
  return (
    pixel.renamedAt &&
    pixel.renamedAt >
      new Date(Date.now() - env.NEXT_PUBLIC_PIXELS_RENAME_LOCK_DURATION_MS)
  );
}

export type DonationPixel = ReturnType<typeof mapDonationPixels>[number];

function mapDonationPixels(pixels: PixelWithDonation[]) {
  return pixels
    .filter((pixel) => isMuralId(pixel.muralId))
    .map((pixel) => {
      return {
        muralId: pixel.muralId as MuralId,
        provider: pixel.donation.provider as Providers,
        donationId: pixel.donationId,
        receivedAt: pixel.receivedAt,
        id: pixel.id,
        identifier: pixel.identifier,
        column: pixel.column,
        row: pixel.row,
        lockedUntil: pixel.renamedAt
          ? new Date(
              pixel.renamedAt.getTime() +
                env.NEXT_PUBLIC_PIXELS_RENAME_LOCK_DURATION_MS,
            )
          : undefined,
      } as const;
    });
}

async function guardExternalSearchMutation(req: NextApiRequest) {
  const clientIp = getClientIp(req);
  if (clientIp) {
    const isAllowed = await limit(
      `donations-pixels-external-search-${clientIp}`,
      5,
      "60 s",
    );
    if (!isAllowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many attempts. Please wait until you try again.",
      });
    }
  }
}

export type DonationFeed = Awaited<ReturnType<typeof getDonationFeed>>;

function getNeonDonorFromRequest(req: NextApiRequest) {
  return getNeonDonorSession(req.cookies[NEON_DONOR_SESSION_COOKIE]);
}

const neonDonorProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const neonDonor = await getNeonDonorFromRequest(ctx.req);
  if (!neonDonor) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not logged in with Neon",
    });
  }

  return next({ ctx: { ...ctx, neonDonor } });
});

export const donationsRouter = router({
  getDonationFeed: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageDonations))
    .input(
      z.object({
        cursor: z.string().nullish(),
        onlyPixels: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => {
      const { cursor } = input;

      const donations = await getDonationFeed({
        take: DONATION_FEED_ENTRIES_PER_PAGE + 1,
        cursor: cursor || undefined,
        onlyPixels: input.onlyPixels,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (donations.length > DONATION_FEED_ENTRIES_PER_PAGE) {
        const nextItem = donations.pop();
        nextCursor = nextItem?.id || undefined;
      }

      return { donations, nextCursor };
    }),

  createDonations: sharedKeyProcedure
    .input(
      z.object({
        donations: z.array(DonationSchema),
      }),
    )
    .mutation(({ input }) => {
      return createDonations(input.donations);
    }),

  getPixels: sharedKeyProcedure
    .input(z.object({ muralId: z.string() }))
    .query(({ input }) => getPixels(input.muralId)),

  createPixels: sharedKeyProcedure
    .input(
      z.object({
        pixels: z.array(
          PixelSchema.omit({ data: true }).extend({
            metadata: z.object({
              twitchBroadcasterId: z.string().optional(),
            }),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      waitUntil(sendChatMessages(input.pixels));
      await createPixels(input.pixels);
    }),

  removeDonations: sharedKeyProcedure
    .input(
      z.object({
        donations: z.array(
          z.object({
            provider: z.string(),
            providerUniqueId: z.string(),
          }),
        ),
        reason: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { removed, orphanPixels } = await removeDonations(input.donations);
      const messages = removed
        .filter((donation) => donation.pixels.length)
        .map((donation) => {
          const identifiers = [
            ...new Set(donation.pixels.map((pixel) => pixel.identifier)),
          ];
          return `${donation.providerUniqueId}: removed ${donation.pixels.length} ${pluralize("pixel", donation.pixels.length)} of ${identifiers.join(", ")}`;
        });
      if (orphanPixels > 0) {
        messages.push(
          `removed ${orphanPixels} ${pluralize("pixel", orphanPixels)} without a donation`,
        );
      }
      if (env.PIXELS_AUDIT_LOG_DISCORD_WEBHOOK_URL && messages.length) {
        waitUntil(
          triggerPlainDiscordChannelWebhook({
            webhookUrl: env.PIXELS_AUDIT_LOG_DISCORD_WEBHOOK_URL,
            contentMessage:
              `Removing donations (${input.reason})\n` + messages.join("\n"),
          }),
        );
      }
      return {
        donations: removed.length,
        pixels:
          orphanPixels +
          removed.reduce(
            (total, donation) => total + donation.pixels.length,
            0,
          ),
      };
    }),

  getMyPixels: protectedProcedure
    .input(z.object({ muralId: z.string() }))
    .query(async ({ input, ctx }) =>
      mapDonationPixels(await getMyPixels(input.muralId, ctx.session.user)),
    ),

  getExternalPixels: publicProcedure
    .input(
      z.object({
        muralId: z.string(),
        verification: externalVerificationSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await guardExternalSearchMutation(ctx.req);
      return mapDonationPixels(
        await getExternalPixelsByVerification(
          input.muralId,
          input.verification,
        ),
      );
    }),

  renameMyPixels: protectedProcedure
    .input(
      z.object({
        muralId: z.string(),
        newIdentifier: pixelIdentifierSchema,
        pixelId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const pixels = await getMyPixels(
        input.muralId,
        ctx.session.user,
        input.pixelId,
      ).catch(() => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find pixels (database)",
        });
      });

      return renamePixels(
        pixels,
        input.newIdentifier,
        `Twitch login (${ctx.session.user.name})`,
      );
    }),

  renameExternalPixels: publicProcedure
    .input(
      z.object({
        muralId: z.string(),
        newIdentifier: pixelIdentifierSchema,
        verification: externalVerificationSchema,
        pixelId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await guardExternalSearchMutation(ctx.req);

      const pixels = await getExternalPixelsByVerification(
        input.muralId,
        input.verification,
        input.pixelId,
      ).catch(() => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find pixels (database)",
        });
      });

      return renamePixels(
        pixels,
        input.newIdentifier,
        `Donation info (${input.verification.firstName} ${input.verification.lastName[0]})`,
      );
    }),

  getNeonDonor: publicProcedure.query(async ({ ctx }) => {
    const config = getNeonOAuthConfig();
    const neonDonor = config ? await getNeonDonorFromRequest(ctx.req) : null;
    return {
      isEnabled: config !== null,
      isLoggedIn: neonDonor !== null,
      logoutUrl: config ? getNeonLogoutUrl(config) : null,
    };
  }),

  getNeonPixels: neonDonorProcedure
    .input(z.object({ muralId: z.string() }))
    .query(async ({ input, ctx }) =>
      mapDonationPixels(
        await getNeonPixels(input.muralId, ctx.neonDonor.accountId),
      ),
    ),

  renameNeonPixels: neonDonorProcedure
    .input(
      z.object({
        muralId: z.string(),
        newIdentifier: pixelIdentifierSchema,
        pixelId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const pixels = await getNeonPixels(
        input.muralId,
        ctx.neonDonor.accountId,
        input.pixelId,
      ).catch(() => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find pixels (database)",
        });
      });

      return renamePixels(
        pixels,
        input.newIdentifier,
        `Neon login (account ${ctx.neonDonor.accountId})`,
      );
    }),
});

async function renamePixels(
  pixels: PixelWithDonation[],
  newIdentifier: string,
  auditVerification: string,
) {
  const affectedMurals = new Set<MuralId>();
  const results = await Promise.all(
    pixels.map((pixel) =>
      (async () => {
        if (isPixelLocked(pixel)) {
          return {
            pixelId: pixel.id,
            isSkipped: true,
            isError: false,
            isSuccess: false,
            reason: "locked" as const,
          };
        }

        if (pixel.identifier === newIdentifier) {
          return {
            pixelId: pixel.id,
            isSkipped: true,
            isError: false,
            isSuccess: false,
            reason: "same" as const,
          };
        }

        try {
          if (isMuralId(pixel.muralId)) affectedMurals.add(pixel.muralId);

          await renamePixel(pixel.id, newIdentifier);
          return {
            pixelId: pixel.id,
            isSuccess: true,
            isError: false,
            isSkipped: false,
          };
        } catch (_) {
          return {
            pixelId: pixel.id,
            isError: true,
            isSuccess: false,
            isSkipped: false,
            errorMessage: "Failed to rename pixel",
          };
        }
      })(),
    ),
  );

  // The donations worker only knows one key, the first one in the list
  const [sharedKey] = env.TRPC_API_SHARED_KEY;
  if (env.NEXT_PUBLIC_DONATIONS_MANAGER_URL && sharedKey) {
    const doesAffectLiveMural = affectedMurals
      .values()
      .some((muralId) => murals[muralId].type === "live");

    if (doesAffectLiveMural) {
      // Trigger a rebuild of the dynamic mural cache, without delaying the
      // response but making sure the request isn't cut off after it
      waitUntil(
        fetch(`${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/resync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `ApiKey ${sharedKey}`,
          },
        })
          .then((res) => {
            if (!res.ok) {
              console.error(
                `[pixels] mural resync responded with ${res.status}`,
              );
            }
          })
          .catch((err) => console.error("[pixels] mural resync failed", err)),
      );
    }
  }

  if (env.PIXELS_AUDIT_LOG_DISCORD_WEBHOOK_URL) {
    const messages: string[] = [];

    const renamedIds = results.filter((r) => r.isSuccess).map((r) => r.pixelId);
    pixels.forEach((pixel) => {
      if (!renamedIds.includes(pixel.id)) return;

      const gridRef = coordsToGridRef({ x: pixel.column, y: pixel.row });
      messages.push(
        `${gridRef.x}:${gridRef.y} – \`${pixel.identifier}\` to \`${newIdentifier}\` (${pixel.id})`,
      );
    });

    if (messages.length) {
      await triggerPlainDiscordChannelWebhook({
        webhookUrl: env.PIXELS_AUDIT_LOG_DISCORD_WEBHOOK_URL,
        contentMessage:
          `Renaming (${auditVerification})\n` + messages.join("\n\n"),
      });
    }
  }

  return results;
}

const sendChatMessages = async (
  pixels: (Omit<Pixel, "data"> & {
    metadata: { twitchBroadcasterId?: string };
  })[],
) => {
  const account = await prisma.account.findFirst({
    where: {
      provider: "twitch",
      providerAccountId: channels.alveusgg.id,
    },
    select: {
      access_token: true,
    },
  });

  if (!account?.access_token) {
    throw new Error("No Twitch account found");
  }
  const { access_token } = await decryptAccountTokens(account);
  if (!access_token) {
    throw new Error("No Twitch account found");
  }

  const pixelsByBroadcasterId = Object.groupBy(
    pixels,
    (pixel) => pixel.metadata.twitchBroadcasterId ?? channels.alveus.id,
  );

  for (const broadcasterId in pixelsByBroadcasterId) {
    try {
      const users = Object.groupBy(
        pixelsByBroadcasterId[broadcasterId] ?? [],
        (pixel) => pixel.identifier,
      );
      for (const identifier in users) {
        const pixels = users[identifier];

        await sendChatMessage(
          access_token,
          channels.alveusgg.id,
          broadcasterId,
          `alveusLove ${identifier} has unlocked ${pixels?.length} ${pluralize("pixel", pixels?.length)}! ${getShortBaseUrl()}/pixels?s=${encodeURIComponent(identifier).replace(/^%40/, "@")}`,
        );
      }
    } catch {
      console.log(
        `Unable to send chat messages for broadcaster ${broadcasterId}`,
      );
    }
  }
};
