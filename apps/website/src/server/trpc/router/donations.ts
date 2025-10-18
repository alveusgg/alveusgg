import { waitUntil } from "@vercel/functions";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import {
  DonationSchema,
  type Pixel,
  PixelSchema,
} from "@alveusgg/donations-core";

import { sendChatMessage } from "@/server/apis/twitch";
import {
  createDonations,
  createPixels,
  getPublicDonations,
} from "@/server/db/donations";
import {
  publicProcedure,
  router,
  sharedKeyProcedure,
} from "@/server/trpc/trpc";

import { channels } from "@/data/twitch";

const DONATION_FEED_ENTRIES_PER_PAGE = 50;

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
});

const sendChatMessages = async (
  pixels: (Omit<Pixel, "data"> & {
    metadata: { twitchBroadcasterId?: string };
  })[],
) => {
  const pixelsByBroadcasterId = Object.groupBy(
    pixels,
    (pixel) => pixel.metadata.twitchBroadcasterId ?? channels.alveus.id,
  );

  for (const broadcasterId in pixelsByBroadcasterId) {
    try {
      const account = await prisma.twitchChannel.findFirst({
        where: {
          channelId: broadcasterId,
        },
        include: {
          broadcasterAccount: {
            select: {
              access_token: true,
            },
          },
        },
      });

      if (!account?.broadcasterAccount?.access_token) {
        throw new Error("No Twitch account found");
      }

      const users = Object.groupBy(
        pixelsByBroadcasterId[broadcasterId] ?? [],
        (pixel) => pixel.identifier,
      );
      for (const identifier in users) {
        const pixels = users[identifier];

        await sendChatMessage(
          account.broadcasterAccount.access_token,
          channels.alveusgg.id,
          broadcasterId,
          `alveusLove ${identifier} has unlocked ${pixels?.length} something secret! https://alveus.gg/secret?u=${identifier}`,
        );
      }
    } catch {
      console.log(
        `Unable to send chat messages for broadcaster ${broadcasterId}`,
      );
    }
  }
};
