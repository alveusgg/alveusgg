import { z } from "zod";

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
import { getUserTwitchAccount } from "@/server/utils/auth";

import { channels } from "@/data/twitch";

export const runCommandSchema = z.object({
  command: z.enum(["ptzload"]),
  args: z.array(z.string()).optional(),
});

export const streamRouter = router({
  getWeather: publicProcedure.query(getWeather),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const twitchAccount = await getUserTwitchAccount(ctx.session.user.id, true);
    return getUserSubscribedToBroadcaster(
      twitchAccount.token,
      twitchAccount.id,
      channels.alveus.id,
    );
  }),

  runCommand: protectedProcedure
    .input(runCommandSchema)
    .mutation(async ({ ctx, input }) => {
      const twitchAccount = await getUserTwitchAccount(
        ctx.session.user.id,
        true,
      );
      const { command, args } = input;

      // TODO: Check if user is subscribed + send directly to bot
      await sendChatMessage(
        twitchAccount.token,
        twitchAccount.id,
        channels.alveusgg.id,
        `!${command} ${args?.join(" ") || ""}`,
      );
    }),
});
