import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  getUserByName,
  setupWebhookSubscriptionForBroadcaster,
} from "@/server/apis/twitch";
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
  sharedKeyProcedure,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageTwitchApi),
);

const roles = ["moderator", "broadcaster"] as const;
const roleToScopePrefixMap: Record<(typeof roles)[number], string> = {
  broadcaster: "channel:",
  moderator: "moderator:",
};

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
        role: z.literal([...roles]),
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
      } catch (_) {
        throw new TRPCError({
          message: "Could not update channel config",
          code: "BAD_REQUEST",
        });
      }

      return { success: true };
    }),

  setupWebhookSubscription: sharedKeyProcedure
    .input(
      z.object({
        event: z.object({ type: z.string(), version: z.string() }),
        url: z.string(),
        secret: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const supportedChannels = [
        channels.alveusgg.id,
        channels.maya.id,
        channels.alveus.id,
      ];

      for (const channel of supportedChannels) {
        try {
          return await setupWebhookSubscriptionForBroadcaster(
            channel,
            input.event.type,
            input.event.version,
            input.url,
            input.secret,
          );
        } catch {
          console.error(
            `Failed to setup webhook subscription for channel ${channel}`,
          );
        }
      }
    }),
});
