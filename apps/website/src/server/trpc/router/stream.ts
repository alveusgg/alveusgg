import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { sendChatMessage } from "@/server/apis/twitch";
import { getWeather } from "@/server/apis/weather";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import invariant from "@/utils/invariant";
import { createJWT, signJWT } from "@/utils/jwt";

export const runCommandSchema = z.object({
  command: z.enum(["ptzload"]),
  args: z.array(z.string()).optional(),
});

const ptzProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.managePTZControls),
);

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
