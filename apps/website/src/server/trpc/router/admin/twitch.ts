import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  getUserByName,
  setupWebhookSubscriptionsForBroadcasters,
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
import { channels, scopeGroups } from "@/data/twitch";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageTwitchApi),
);

const roles = ["moderator", "broadcaster"] as const;
// Accounts get connected after granting the "api" scope group on /admin/twitch,
// and the session callback requires all of it once an account is connected
const requiredScopes = scopeGroups.api;

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
            where: { provider: "twitch" },
          },
        },
      });

      // Check that the account has every scope the API access needs
      const account = userWithAccount?.accounts.find((account) => {
        const accountScopes = new Set(account.scope?.split(" "));
        return requiredScopes.every((scope) => accountScopes.has(scope));
      });
      if (!account) {
        throw new TRPCError({
          message: `Twitch account is missing required scopes for ${input.role}: ${requiredScopes.join(", ")}`,
          code: "BAD_REQUEST",
        });
      }

      // A broadcaster must be the owner of the channel
      if (
        input.role === "broadcaster" &&
        account.providerAccountId !== input.twitchChannelId
      ) {
        throw new TRPCError({
          message: "Twitch account is not the broadcaster of this channel",
          code: "BAD_REQUEST",
        });
      }

      // TODO: Check if the user is actually a moderator in the channel, this
      //        needs the "moderation:read" scope and a call to the Get Moderators
      //        API using the broadcaster's token (or "user:read:moderated_channels"
      //        with the Get Moderated Channels API using the user's own token)

      try {
        await ctx.prisma.twitchChannel.update({
          where: { channelId: input.twitchChannelId },
          data: {
            broadcasterAccount:
              input.role === "broadcaster"
                ? { connect: { id: account.id } }
                : undefined,
            moderatorAccount:
              input.role === "moderator"
                ? { connect: { id: account.id } }
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

      // Reconcile all channels, but propagate failures so the worker retries and
      // reports them rather than caching a false success.
      return setupWebhookSubscriptionsForBroadcasters(
        supportedChannels,
        input.event.type,
        input.event.version,
        input.url,
        input.secret,
      );
    }),
});
