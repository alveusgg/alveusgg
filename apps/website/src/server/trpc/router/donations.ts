import { TRPCError } from "@trpc/server";
import { waitUntil } from "@vercel/functions";
import type { NextApiRequest } from "next";
import pluralize from "pluralize";
import { z } from "zod";

import { type Prisma, prisma } from "@alveusgg/database";

import {
  DonationSchema,
  type Pixel,
  PixelSchema,
  Providers,
} from "@alveusgg/donations-core";

import { env } from "@/env";

import { sendChatMessage } from "@/server/apis/twitch";
import {
  type DonationWithPixel,
  createDonations,
  createPixels,
  filterDonationByPayPalEmail,
  filterDonationByPayPalVerification,
  filterDonationByTwitchUserId,
  getMyDonationsWithPixels,
  getPayPalDonationsByVerification,
  getPixels,
  getPublicDonations,
  renamePixel,
} from "@/server/db/donations";
import { getTwitchUserId } from "@/server/db/users";
import { triggerPlainDiscordChannelWebhook } from "@/server/outgoing-webhooks";
import {
  protectedProcedure,
  publicProcedure,
  router,
  sharedKeyProcedure,
} from "@/server/trpc/trpc";
import { limit } from "@/server/utils/rate-limit";

import { channels } from "@/data/twitch";

import { getShortBaseUrl } from "@/utils/short-url";
import type { trpc } from "@/utils/trpc";

import {
  PIXEL_RENAME_LOCK_DURATION_MS,
  pixelIdentifierSchema,
} from "@/hooks/pixels";

import { payPalVerificationSchema } from "@/components/institute/EditPayPalPixels";
import { coordsToGridRef } from "@/components/institute/Pixels";

const DONATION_FEED_ENTRIES_PER_PAGE = 50;

export type RenameMyPixelMutation = typeof trpc.donations.renameMyPixel;
export type RenamePayPalPixelMutation = typeof trpc.donations.renamePayPalPixel;
export type AnyRenamePixelMutation =
  | RenameMyPixelMutation
  | RenamePayPalPixelMutation;

export type RenameAllMyPixelsMutation = typeof trpc.donations.renameAllMyPixels;
export type RenameAllPayPalPixels = typeof trpc.donations.renameAllPayPalPixels;
export type AnyRenameAllPixelsMutation =
  | RenameAllMyPixelsMutation
  | RenameAllPayPalPixels;

export type MyPixel = {
  id: string;
  donationId: string;
  receivedAt: Date;
  identifier: string;
  column: number;
  row: number;
  provider: Providers;
  lockedUntil?: Date;
};

function updatePixelOnDonationsManager(
  column: number,
  row: number,
  identifier: string,
) {
  return fetch(
    `${env.NEXT_PUBLIC_DONATIONS_MANAGER_URL}/pixels/update/${column}/${row}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ApiKey ${env.TRPC_API_SHARED_KEY}`,
      },
      body: JSON.stringify({
        data: {
          identifier,
        },
      }),
    },
  );
}

function isPixelLocked(pixel: { renamedAt: Date | null }) {
  return (
    pixel.renamedAt &&
    pixel.renamedAt > new Date(Date.now() - PIXEL_RENAME_LOCK_DURATION_MS)
  );
}

async function auditLogPixelRename(
  verifiction: string,
  newIdentifier: string,
  pixels: Array<{
    id: string;
    identifier: string;
    column: number;
    row: number;
  }>,
) {
  if (env.PIXELS_AUDIT_LOG_DISCORD_WEBHOOK_URL) {
    const messages: string[] = [];

    pixels.forEach((pixel) => {
      const gridRef = coordsToGridRef({ x: pixel.column, y: pixel.row });
      messages.push(
        [
          `${gridRef.x}:${gridRef.y} – \`${pixel.identifier}\` to \`${newIdentifier}\``,
          `Verification: ${verifiction}`,
          `Pixel: ${pixel.id}`,
        ].join("\n"),
      );
    });

    await triggerPlainDiscordChannelWebhook({
      webhookUrl: env.PIXELS_AUDIT_LOG_DISCORD_WEBHOOK_URL,
      contentMessage: "Renaming\n" + messages.join("\n\n"),
    });
  }
}

export type DonationPixel = ReturnType<typeof mapDonationPixels>[number];

function mapDonationPixels(donation: DonationWithPixel) {
  return donation.pixels.map((pixel) => {
    return {
      provider: donation.provider as Providers,
      donationId: donation.id,
      receivedAt: donation.receivedAt,
      id: pixel.id,
      identifier: pixel.identifier,
      column: pixel.column,
      row: pixel.row,
      lockedUntil: pixel.renamedAt
        ? new Date(pixel.renamedAt.getTime() + PIXEL_RENAME_LOCK_DURATION_MS)
        : undefined,
    } as const;
  });
}

async function guardPayPalSearchMutation(req: NextApiRequest) {
  const clientIp = req.headers["x-forwarded-for"];
  if (typeof clientIp === "string") {
    const isAllowed = await limit(
      `donations-pixels-paypal-search-${clientIp}`,
      5,
      "10 s",
    );
    if (!isAllowed) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Too many attempts. Please wait one hour until you try again.",
      });
    }
  }
}

export const donationsRouter = router({
  getDonationsPublic: publicProcedure
    .input(
      z.object({
        cursor: z.cuid().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { cursor } = input;

      const donations = await getPublicDonations({
        take: DONATION_FEED_ENTRIES_PER_PAGE + 1,
        cursor: cursor || undefined,
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

  getPixels: sharedKeyProcedure.query(() => getPixels()),

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

  getMyPixels: protectedProcedure.query(async ({ ctx }) => {
    const donations = await getMyDonationsWithPixels(ctx.session.user);
    return donations.flatMap(mapDonationPixels);
  }),

  getPayPalPixels: publicProcedure
    .input(payPalVerificationSchema)
    .mutation(async ({ input, ctx }) => {
      await guardPayPalSearchMutation(ctx.req);

      const donations = await getPayPalDonationsByVerification(input);
      return donations.flatMap(mapDonationPixels);
    }),

  renameAllMyPixels: protectedProcedure
    .input(
      z.object({
        newIdentifier: pixelIdentifierSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const donations = await getMyDonationsWithPixels(ctx.session.user).catch(
        () => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to find pixels (database)",
          });
        },
      );

      return renameDonationPixels(
        donations,
        input.newIdentifier,
        `Twitch login (${ctx.session.user.name})`,
      );
    }),

  renameAllPayPalPixels: protectedProcedure
    .input(
      z.object({
        newIdentifier: pixelIdentifierSchema,
        verification: payPalVerificationSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await guardPayPalSearchMutation(ctx.req);

      const donations = await getPayPalDonationsByVerification(
        input.verification,
      ).catch(() => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find pixels (database)",
        });
      });

      return renameDonationPixels(
        donations,
        input.newIdentifier,
        `PayPal info (${input.verification.firstName} ${input.verification.lastName[0]})`,
      );
    }),

  renameMyPixel: protectedProcedure
    .input(
      z.object({
        provider: Providers,
        donationId: z.string(),
        pixelId: z.string(),
        newIdentifier: pixelIdentifierSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const twitchUserId = await getTwitchUserId(ctx.session.user.id);
      if (!twitchUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Twitch account linked",
        });
      }

      let filter: Prisma.DonationWhereInput;
      if (input.provider === "twitch") {
        filter = filterDonationByTwitchUserId(twitchUserId);
      } else {
        const emailAddress = ctx.session.user.email;
        if (!emailAddress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No email address associated with account",
          });
        }
        filter = filterDonationByPayPalEmail(emailAddress);
      }

      await renamePixelByFilterMutation(
        input.pixelId,
        input.donationId,
        input.newIdentifier,
        filter,
        `Twitch login (${ctx.session.user.name})`,
      );
    }),

  renamePayPalPixel: publicProcedure
    .input(
      z.object({
        donationId: z.string(),
        pixelId: z.string(),
        newIdentifier: pixelIdentifierSchema,
        verification: payPalVerificationSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await guardPayPalSearchMutation(ctx.req);

      await renamePixelByFilterMutation(
        input.pixelId,
        input.donationId,
        input.newIdentifier,
        filterDonationByPayPalVerification(input.verification),
        `PayPal info (${input.verification.firstName} ${input.verification.lastName[0]})`,
      );
    }),
});

async function renameDonationPixels(
  donations: DonationWithPixel[],
  newIdentifier: string,
  auditVerification: string,
) {
  let renamedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  const renamePromises: Promise<
    DonationWithPixel["pixels"][number] | undefined
  >[] = [];

  for (const donation of donations) {
    for (const pixel of donation.pixels) {
      if (isPixelLocked(pixel)) {
        skippedCount++;
        continue;
      }

      if (pixel.identifier === newIdentifier) {
        // We skip but do not tell the user,
        // this is basically just an optimization
        continue;
      }

      renamePromises.push(
        (async () => {
          const res = await updatePixelOnDonationsManager(
            pixel.column,
            pixel.row,
            newIdentifier,
          ).catch(() => {});

          if (!res?.ok) {
            failedCount++;
            return;
          }

          try {
            await renamePixel(pixel.id, newIdentifier);
            renamedCount++;
            return pixel;
          } catch (_) {
            failedCount++;

            // Try to roll back the change on the donations manager
            updatePixelOnDonationsManager(
              pixel.column,
              pixel.row,
              pixel.identifier,
            ).catch(() => {});
          }
        })(),
      );
    }
  }

  const renamedPixels = (await Promise.allSettled(renamePromises))
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((p) => p !== undefined);

  await auditLogPixelRename(auditVerification, newIdentifier, renamedPixels);

  return { renamedCount, failedCount, skippedCount };
}

async function renamePixelByFilterMutation(
  id: string,
  donationId: string,
  newIdentifier: string,
  filter: Omit<Prisma.DonationWhereInput, "id">,
  auditVerification: string,
) {
  if (!env.NEXT_PUBLIC_DONATIONS_MANAGER_URL || !env.TRPC_API_SHARED_KEY) {
    throw new Error("Donations manager is not configured");
  }

  const pixel = await prisma.pixel
    .findFirst({
      where: {
        id,
        donation: {
          id: donationId,
          ...filter,
        },
      },
    })
    .catch(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to verify Pixel ownership (database)",
      });
    });

  if (!pixel) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not verify Pixel ownership (not found)",
    });
  }

  if (isPixelLocked(pixel)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Pixel has been renamed recently and cannot be renamed again yet",
    });
  }

  if (pixel.identifier === newIdentifier) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "New identifier is the same as the current identifier",
    });
  }

  const res = await updatePixelOnDonationsManager(
    pixel.column,
    pixel.row,
    newIdentifier,
  ).catch(() => {});

  if (!res?.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to rename Pixel (donations manager)",
    });
  }

  await renamePixel(pixel.id, newIdentifier).catch(() => {
    // Try to roll back the change on the donations manager
    updatePixelOnDonationsManager(
      pixel.column,
      pixel.row,
      pixel.identifier,
    ).catch(() => {
      console.error("Failed to roll back Pixel");
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to rename Pixel (database)",
    });
  });

  await auditLogPixelRename(auditVerification, newIdentifier, [pixel]);
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
