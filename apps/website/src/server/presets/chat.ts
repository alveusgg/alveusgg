import { createHash } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { getBroadcasterSubscriptionForUser } from "@/server/apis/twitch";
import { getAlveusBroadcasterToken } from "@/server/db/twitch-channels";
import { getSuperUserIds } from "@/server/utils/auth";
import timingSafeCompareString from "@/server/utils/timing-safe-compare-string";
import { isTwitchUserBanned } from "@/server/utils/twitch-bans";

import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import { subscriberPolicy } from "./policy";
import { commandSchema } from "./schema";
import { operationDto } from "./service";

export const chatActorSchema = z.strictObject({
  twitchUserId: z.string().regex(/^[0-9]{1,32}$/),
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^\P{Cc}+$/u)
    .optional(),
});
export function requireChatbotPresetKey(authorization?: string) {
  const expected = env.CHATBOT_PRESETS_SHARED_KEY;
  const match = /^ApiKey ([^\s]+)$/i.exec(authorization ?? "");
  const supplied = match?.[1];
  if (
    !expected ||
    !supplied ||
    !timingSafeCompareString(
      createHash("sha256").update(supplied).digest("hex"),
      createHash("sha256").update(expected).digest("hex"),
    )
  )
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Chatbot preset service authentication is required.",
    });
}
export async function resolveChatActor(actor: z.infer<typeof chatActorSchema>) {
  const account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "twitch",
        providerAccountId: actor.twitchUserId,
      },
    },
    select: {
      user: {
        select: { id: true, name: true, roles: { select: { role: true } } },
      },
    },
  });
  const siteUser = account?.user;
  // Chat identities never inherit the local browser's DISABLE_ADMIN_AUTH bypass.
  const canManage = Boolean(
    siteUser &&
    (getSuperUserIds().includes(siteUser.id) ||
      siteUser.roles.some(
        ({ role }) => role === permissions.managePTZControls.requiredRole,
      )),
  );
  return {
    id: siteUser?.id ?? `twitch:${actor.twitchUserId}`,
    name: siteUser?.name ?? actor.name,
    twitchUserId: actor.twitchUserId,
    canManage,
  };
}
export type ChatPrincipal = Awaited<ReturnType<typeof resolveChatActor>>;
export async function ownedChatOperation(id: string, actor: ChatPrincipal) {
  const operation = await prisma.cameraPresetOperation.findUnique({
    where: { id },
  });
  if (!operation) return null;
  const original = commandSchema.parse(operation.command);
  if (
    original.actor.id !== actor.id &&
    original.actor.id !== `twitch:${actor.twitchUserId}`
  )
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This preset operation belongs to another user.",
    });
  // Preserve the identity accepted before an optional subsequent website signup.
  return operationDto(operation);
}
export async function authorizeChatPresetAction(
  actor: ChatPrincipal,
  action: string,
  camera: string,
): Promise<"operator" | "subscriber"> {
  if (!actor.canManage)
    await authorizeChatSubscriberLoad(actor, action, camera);
  // Only spend a broadcaster-token ban lookup on a command it could deny.
  let banned: boolean;
  try {
    banned = await isTwitchUserBanned(actor.twitchUserId);
  } catch (error) {
    console.error("Chat preset ban verification failed:", error);
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Preset access verification is temporarily unavailable. Try again shortly.",
    });
  }
  if (banned)
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Preset controls are unavailable while you are banned or timed out in Alveus Sanctuary chat.",
    });
  return actor.canManage ? "operator" : "subscriber";
}
async function authorizeChatSubscriberLoad(
  actor: ChatPrincipal,
  action: string,
  camera: string,
) {
  if (action !== "load")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Preset management requires website camera operator access.",
    });
  let subscribed: boolean;
  try {
    const token = await getAlveusBroadcasterToken("channel:read:subscriptions");
    if (!token)
      throw new Error("Broadcaster subscription credentials unavailable");
    subscribed = await getBroadcasterSubscriptionForUser(
      token,
      channels.alveus.id,
      actor.twitchUserId,
      AbortSignal.timeout(5000),
    );
  } catch {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Subscription verification is temporarily unavailable. Try again shortly.",
    });
  }
  if (!subscribed)
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "An active Alveus Sanctuary subscription is required to load presets.",
    });
  const policy = await subscriberPolicy();
  if (policy.subscriberControlsPaused || policy.pausedCameras.includes(camera))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Subscriber control is paused for this camera.",
    });
}
