import { z } from "zod";

import { prisma } from "@alveusgg/database";

import {
  getUserSubscribedToBroadcaster,
  sendChatMessage,
} from "@/server/apis/twitch";
import { getWeather } from "@/server/apis/weather";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/trpc";

import { channels } from "@/data/twitch";

const getUserTwitchAccount = async (userId: string) => {
  const { access_token: token, providerAccountId: id } =
    (await prisma.account.findFirst({
      where: {
        userId,
        provider: "twitch",
      },
      select: {
        providerAccountId: true,
        access_token: true,
      },
    })) ?? {};
  if (!token || !id) {
    throw new Error("No Twitch account found for user");
  }
  return { token, id };
};

export const runCommandSchema = z.object({
  command: z.enum(["ptzload"]),
  args: z.array(z.string()).optional(),
});

export const streamRouter = router({
  getWeather: publicProcedure.query(getWeather),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const twitchAccount = await getUserTwitchAccount(ctx.session.user.id);
    return getUserSubscribedToBroadcaster(
      twitchAccount.token,
      twitchAccount.id,
      channels.alveus.id,
    );
  }),

  runCommand: protectedProcedure
    .input(runCommandSchema)
    .mutation(async ({ ctx, input }) => {
      const twitchAccount = await getUserTwitchAccount(ctx.session.user.id);
      const { command, args } = input;
      await sendChatMessage(
        twitchAccount.token,
        twitchAccount.id,
        channels.alveusgg.id,
        `!${command} ${args?.join(" ") || ""}`,
      );
    }),
});
