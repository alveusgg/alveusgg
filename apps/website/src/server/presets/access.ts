import { TRPCError } from "@trpc/server";
import { type Session } from "next-auth";

import { getUserSubscribedToBroadcaster } from "@/server/apis/twitch";
import { getSuperUserIds, getUserTwitchAccount } from "@/server/utils/auth";
import { ExpiredAccessTokenError } from "@/server/utils/oauth2";
import {
  isPresetUserBanned,
  isTwitchUserBanned,
} from "@/server/utils/twitch-bans";

import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import { subscriberPolicy } from "./policy";

export type PresetAccess = {
  canLoad: boolean;
  canManage: boolean;
  // Pausing only removes access, so operators keep it while moderation
  // verification is unavailable; only a confirmed ban takes it away.
  canPauseSubscribers: boolean;
  subscriberControlsPaused: boolean;
  pausedCameras: string[];
  reason:
    | "login"
    | "banned"
    | "subscription"
    | "subscription-scope"
    | "unavailable"
    | "paused"
    | null;
};
const bannedMessage =
  "Preset controls are unavailable while you are banned or timed out in Alveus Sanctuary chat.";
const unavailableMessage =
  "Preset access verification is temporarily unavailable. Try again shortly.";
export function canManagePresets(session: Session | null) {
  const user = session?.user;
  return Boolean(
    user &&
    (getSuperUserIds().includes(user.id) ||
      user.roles.includes(permissions.managePTZControls.requiredRole)),
  );
}
async function banStatus(lookup: () => Promise<boolean>) {
  try {
    return (await lookup()) ? "banned" : "clear";
  } catch (error) {
    console.error("Preset chat ban verification failed:", error);
    return "unavailable";
  }
}
export async function presetAccess(
  session: Session | null,
): Promise<PresetAccess> {
  let policy: Awaited<ReturnType<typeof subscriberPolicy>>;
  try {
    policy = await subscriberPolicy();
  } catch {
    return {
      canLoad: false,
      canManage: false,
      canPauseSubscribers: false,
      reason: "unavailable",
      subscriberControlsPaused: true,
      pausedCameras: [],
    };
  }
  const denied = (
    reason: PresetAccess["reason"],
    canPauseSubscribers = false,
  ): PresetAccess => ({
    ...policy,
    canLoad: false,
    canManage: false,
    canPauseSubscribers,
    reason,
  });
  if (!session?.user) return denied("login");
  const userId = session.user.id;
  if (canManagePresets(session)) {
    const ban = await banStatus(() => isPresetUserBanned(userId));
    if (ban === "banned") return denied("banned");
    if (ban === "unavailable") return denied("unavailable", true);
    return {
      ...policy,
      canLoad: true,
      canManage: true,
      canPauseSubscribers: true,
      reason: null,
    };
  }
  if (!session.user.scopes.includes("user:read:subscriptions"))
    return denied("subscription-scope");
  let account, subscription;
  try {
    account = await getUserTwitchAccount(userId);
    subscription = await getUserSubscribedToBroadcaster(
      account.token,
      account.id,
      channels.alveus.id,
      { signal: AbortSignal.timeout(5000), quiet: true },
    );
  } catch (error) {
    return denied(
      error instanceof ExpiredAccessTokenError ||
        (error instanceof TRPCError && error.code === "BAD_REQUEST")
        ? "subscription-scope"
        : "unavailable",
    );
  }
  if (!subscription) return denied("subscription");
  if (policy.subscriberControlsPaused) return denied("paused");
  // Only spend a broadcaster-token ban lookup on a user it could deny.
  const twitchUserId = account.id;
  const ban = await banStatus(() => isTwitchUserBanned(twitchUserId));
  if (ban !== "clear")
    return denied(ban === "banned" ? "banned" : "unavailable");
  return {
    ...policy,
    canLoad: true,
    canManage: false,
    canPauseSubscribers: false,
    reason: null,
  };
}
export async function authorizeSubscriberControl(
  session: Session,
  paused: boolean,
) {
  if (!canManagePresets(session))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Camera operator access is required.",
    });
  const access = await presetAccess(session);
  if (access.reason === "banned")
    throw new TRPCError({ code: "FORBIDDEN", message: bannedMessage });
  if (paused ? !access.canPauseSubscribers : !access.canManage)
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: unavailableMessage,
    });
}
export async function authorizePresetAction(
  session: Session,
  action: string,
  camera: string,
): Promise<"operator" | "subscriber"> {
  if (!canManagePresets(session) && action !== "load")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Preset management requires camera operator access.",
    });
  const access = await presetAccess(session);
  if (access.canManage) return "operator";
  if (access.reason === "banned")
    throw new TRPCError({ code: "FORBIDDEN", message: bannedMessage });
  if (access.canLoad && !access.pausedCameras.includes(camera))
    return "subscriber";
  if (access.reason === "unavailable")
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: unavailableMessage,
    });
  if (access.reason === "paused" || access.pausedCameras.includes(camera))
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Subscriber control is paused for this camera.",
    });
  throw new TRPCError({
    code: "FORBIDDEN",
    message:
      access.reason === "subscription-scope"
        ? "Sign in again to grant subscription verification access."
        : "An active Alveus Sanctuary subscription is required to load presets.",
  });
}
