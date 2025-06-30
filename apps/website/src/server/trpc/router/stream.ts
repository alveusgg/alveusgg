import { z } from "zod/v4";

import { env } from "@/env";

import {
  getUserSubscribedToBroadcaster,
  sendChatMessage,
} from "@/server/apis/twitch";
import { getWeather } from "@/server/apis/weather";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/trpc";
import { getUserTwitchAccount } from "@/server/utils/auth";

import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import invariant from "@/utils/invariant";
import { createJWT, signJWT } from "@/utils/jwt";

export const runCommandSchema = z.object({
  command: z.literal(["ptzload", "swap"]),
  args: z.array(z.string()).optional(),
});

const ptzProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.managePTZControls),
);

export const streamRouter = router({
  getWeather: publicProcedure.query(getWeather),

  getRoundsChecks: publicProcedure.query(({ ctx }) =>
    ctx.prisma.roundsCheck.findMany({
      where: { hidden: false },
      orderBy: { order: "asc" },
    }),
  ),

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

  getFeedUrl: ptzProcedure.query(async () => {
    invariant(env.CF_STREAM_KEY_ID, "CF_STREAM_KEY_ID is not set");
    invariant(env.CF_STREAM_KEY_JWK, "CF_STREAM_KEY_JWK is not set");
    invariant(
      env.CF_STREAM_LOLA_VIDEO_ID,
      "CF_STREAM_LOLA_VIDEO_ID is not set",
    );
    invariant(env.CF_STREAM_HOST, "CF_STREAM_HOST is not set");

    const expiresTimeInSeconds = 60 * 5;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresTimeInSeconds;
    const token = createJWT(
      {
        alg: "RS256",
        kid: env.CF_STREAM_KEY_ID,
      },
      {
        sub: env.CF_STREAM_LOLA_VIDEO_ID,
        kid: env.CF_STREAM_KEY_ID,
        exp: expiresAt,
        accessRules: [
          {
            type: "any",
            action: "allow",
          },
        ],
      },
    );

    const jwt = await signJWT(token, env.CF_STREAM_KEY_JWK);
    return {
      url: `https://${env.CF_STREAM_HOST}/${jwt}/webRTC/play`,
    };
  }),
});
