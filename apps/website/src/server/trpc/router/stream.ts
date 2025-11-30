import { track } from "@vercel/analytics/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import {
  getUserSubscribedToBroadcaster,
  getUsersSubscribedToBroadcaster,
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
import { getViewUrlForFileStorageObjectKey } from "@/server/utils/file-storage";

import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import invariant from "@/utils/invariant";
import { createJWT, signJWT } from "@/utils/jwt";

export const runCommandSchema = z.object({
  command: z.literal(["ptzload", "ptzzoom", "swap"]),
  args: z.array(z.string()).optional(),
});

const ptzProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.managePTZControls),
);

export const streamRouter = router({
  getWeather: publicProcedure.query(getWeather),

  getSubscriptions: publicProcedure.query(async () => {
    // Get auth for the Twitch account
    const twitchChannel = await prisma.twitchChannel.findFirst({
      where: { username: channels.alveus.username },
      select: {
        broadcasterAccount: {
          select: {
            providerAccountId: true,
            access_token: true,
          },
        },
      },
    });
    if (!twitchChannel?.broadcasterAccount?.access_token) {
      throw new Error("No Twitch account found");
    }

    const { total, points } = await getUsersSubscribedToBroadcaster(
      twitchChannel.broadcasterAccount.access_token,
      twitchChannel.broadcasterAccount.providerAccountId,
      1,
    );
    return { total, points };
  }),

  getRoundsChecks: publicProcedure.query(({ ctx }) =>
    ctx.prisma.roundsCheck
      .findMany({
        where: { hidden: false },
        orderBy: { order: "asc" },
        include: { fileStorageObject: true },
      })
      .then((checks) =>
        checks.map(({ fileStorageObject, ...check }) => ({
          ...check,
          fileStorageObjectUrl: fileStorageObject
            ? getViewUrlForFileStorageObjectKey(fileStorageObject.key)
            : null,
        })),
      ),
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

      // Track the command run in the background
      waitUntil(
        track(
          "Command run",
          { command, args: args?.join(" ") ?? null },
          { headers: ctx.req.headers },
        ),
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
