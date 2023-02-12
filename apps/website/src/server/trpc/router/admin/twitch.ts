import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, superUserProcedure } from "../../trpc";

const roles = ["moderator", "broadcaster"] as const;
const roleToScopePrefixMap: Record<(typeof roles)[number], string> = {
  broadcaster: "channel:",
  moderator: "moderator:",
};

export const adminTwitchRouter = router({
  getChannels: superUserProcedure.query(({ ctx }) =>
    ctx.prisma.twitchChannel.findMany({
      include: { broadcasterAccount: true, moderatorAccount: true },
    })
  ),
  connectUserAsBroadcasterOrModerator: superUserProcedure
    .input(
      z.object({
        twitchChannelId: z.string(),
        role: z.enum(roles),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      if (!userId) {
        throw new TRPCError({
          message: "User does not exist",
          code: "BAD_REQUEST",
        });
      }
      const userWithAccount = await ctx.prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: {
            where: {
              provider: "twitch",
              // TODO: This check is very rudimentary. It would be best to check each required scope explicitly
              //        and not only if any with the scope prefix are set
              scope: { contains: roleToScopePrefixMap[input.role] },
            },
          },
        },
      });
      const accountId = userWithAccount?.accounts[0]?.id;
      if (!accountId) {
        throw new TRPCError({
          message: "User does not have scope!",
          code: "BAD_REQUEST",
        });
      }

      // TODO: Check if the user is actually broadcaster/moderator in the channel?!

      try {
        await ctx.prisma.twitchChannel.update({
          where: { channelId: input.twitchChannelId },
          data: {
            broadcasterAccount:
              input.role === "broadcaster"
                ? { connect: { id: accountId } }
                : undefined,
            moderatorAccount:
              input.role === "moderator"
                ? { connect: { id: accountId } }
                : undefined,
          },
        });
      } catch (e) {
        throw new TRPCError({
          message: "Could not update channel config",
          code: "BAD_REQUEST",
        });
      }

      return { success: true };
    }),
});
