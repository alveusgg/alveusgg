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

import { sendChatMessage } from "@/server/apis/twitch";
import {
  type PixelWithDonation,
  createDonations,
  createPixels,
  getDonationFeed,
  getMyPixels,
  getPayPalPixelsByVerification,
  getPixels,
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
import { limit } from "@/server/utils/rate-limit";

import { type MuralId, isMuralId } from "@/data/murals";
import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import { getShortBaseUrl } from "@/utils/short-url";

import { payPalVerificationSchema } from "@/components/institute/EditPayPalPixels";
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

async function guardPayPalSearchMutation(req: NextApiRequest) {
  const clientIp = req.headers["x-forwarded-for"];
  if (typeof clientIp === "string") {
    // FIXME: Increase to a reasonable token window
    const isAllowed = await limit(
      `donations-pixels-paypal-search-${clientIp}`,
      5,
      "10 s",
    );
    if (!isAllowed) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Too many attempts. Please wait until you try again.",
      });
    }
  }
}

export type DonationFeed = Awaited<ReturnType<typeof getDonationFeed>>;

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

  getMyPixels: protectedProcedure
    .input(z.object({ muralId: z.string() }))
    .query(async ({ input, ctx }) =>
      mapDonationPixels(await getMyPixels(input.muralId, ctx.session.user)),
    ),

  getPayPalPixels: publicProcedure
    .input(
      z.object({
        muralId: z.string(),
        verification: payPalVerificationSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await guardPayPalSearchMutation(ctx.req);
      return mapDonationPixels(
        await getPayPalPixelsByVerification(input.muralId, input.verification),
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

  renamePayPalPixels: publicProcedure
    .input(
      z.object({
        muralId: z.string(),
        newIdentifier: pixelIdentifierSchema,
        verification: payPalVerificationSchema,
        pixelId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await guardPayPalSearchMutation(ctx.req);

      const pixels = await getPayPalPixelsByVerification(
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
        `PayPal info (${input.verification.firstName} ${input.verification.lastName[0]})`,
      );
    }),
});

async function renamePixels(
  pixels: PixelWithDonation[],
  newIdentifier: string,
  auditVerification: string,
) {
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
          account.access_token,
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
