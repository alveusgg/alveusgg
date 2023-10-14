import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTwitchChannel,
  deleteTwitchChannel,
  editTwitchChannel,
  getTwitchChannels,
} from "@/server/db/twitch-channels";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import type { subscriptionSchema } from "@/server/utils/twitch-api";
import { getSubscriptions, getUserByName } from "@/server/utils/twitch-api";
import { permissions } from "@/config/permissions";

type Subscription = z.infer<typeof subscriptionSchema>;

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageTwitchApi),
);

const roles = ["moderator", "broadcaster"] as const;
const roleToScopePrefixMap: Record<(typeof roles)[number], string> = {
  broadcaster: "channel:",
  moderator: "moderator:",
};

function sortSubscriptionByBroadcasterId(a: Subscription, b: Subscription) {
  const idA = a.condition.broadcaster_user_id;
  const idB = b.condition.broadcaster_user_id;

  if (idA < idB) {
    return -1;
  }
  if (idA > idB) {
    return 1;
  }
  return 0;
}

export const adminTwitchRouter = router({
  getChannels: permittedProcedure.query(getTwitchChannels),

  getChannel: permittedProcedure
    .input(z.string())
    .query(async ({ ctx, input: channelId }) =>
      ctx.prisma.twitchChannel.findUnique({ where: { channelId } }),
    ),

  createOrEditChannel: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create"), username: z.string() }),
          z.object({ action: z.literal("edit"), channelId: z.string() }),
        ])
        .and(
          z.object({
            label: z.string(),
          }),
        ),
    )
    .mutation(async ({ input }) => {
      switch (input.action) {
        case "create": {
          const { action: _, username, label } = input;
          const user = await getUserByName(username);
          if (!user) {
            throw new TRPCError({
              message: "User does not exist",
              code: "BAD_REQUEST",
            });
          }
          await createTwitchChannel({
            label,
            channelId: user.id,
            username: user.login,
          });
          break;
        }

        case "edit": {
          const { action: _, channelId, ...data } = input;
          await editTwitchChannel(channelId, data);
          break;
        }
      }
    }),

  deleteChannel: permittedProcedure
    .input(z.string())
    .mutation(async ({ input: channelId }) => deleteTwitchChannel(channelId)),

  getUserScope: permittedProcedure.query(({ ctx }) =>
    ctx.prisma.account.findFirst({
      where: {
        userId: ctx.session.user?.id,
        type: "oauth",
        provider: "twitch",
      },
      select: {
        scope: true,
      },
    }),
  ),

  connectUserAsBroadcasterOrModerator: permittedProcedure
    .input(
      z.object({
        twitchChannelId: z.string(),
        role: z.enum(roles),
      }),
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
          message: "User does not have scope! " + userId,
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

  getActiveEventSubscriptions: permittedProcedure.query(async () => {
    const twitchEventSubs = await getSubscriptions();
    if (twitchEventSubs.data) {
      twitchEventSubs.data.sort(sortSubscriptionByBroadcasterId);
      return twitchEventSubs.data;
    }
    return null;
  }),
});
