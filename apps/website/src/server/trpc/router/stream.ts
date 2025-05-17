import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { sendChatMessage } from "@/server/apis/twitch";
import { getWeather } from "@/server/apis/weather";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/trpc";

export const runCommandSchema = z.object({
  command: z.enum(["ptzload"]),
  args: z.array(z.string()).optional(),
});

export const streamRouter = router({
  getWeather: publicProcedure.query(getWeather),

  runCommand: protectedProcedure
    .input(runCommandSchema)
    .mutation(async ({ ctx, input }) => {
      const { command, args } = input;

      // Get the user's Twitch access token
      const account = await prisma.account.findFirst({
        where: {
          userId: ctx.session.user.id,
          provider: "twitch",
        },
        select: {
          providerAccountId: true,
          access_token: true,
        },
      });
      if (!account || !account.access_token) {
        throw new Error("No Twitch account found for user");
      }

      await sendChatMessage(
        account.access_token,
        account.providerAccountId,
        "858050963",
        `!${command} ${args?.join(" ") || ""}`,
      );
    }),
});
