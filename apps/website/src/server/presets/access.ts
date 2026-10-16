import { TRPCError } from "@trpc/server";
import { type Session } from "next-auth";

import { getUserSubscribedToBroadcaster } from "@/server/apis/twitch";
import { checkPermissions, getUserTwitchAccount } from "@/server/utils/auth";
import { ExpiredAccessTokenError } from "@/server/utils/oauth2";

import { permissions } from "@/data/permissions";
import { channels } from "@/data/twitch";

import { subscriberPolicy } from "./policy";

export type PresetAccess = {
  canLoad: boolean;
  canManage: boolean;
  subscriberControlsPaused: boolean;
  pausedCameras: string[];
  reason:
    | "login"
    | "subscription"
    | "subscription-scope"
    | "unavailable"
    | "paused"
    | null;
};
export function canManagePresets(session: Session | null) {
  return checkPermissions(permissions.managePTZControls, session?.user);
}
export async function presetAccess(
  session: Session | null,
): Promise<PresetAccess> {
  let policy;
  try {
    policy = await subscriberPolicy();
  } catch {
    return {
      canLoad: false,
      canManage: false,
      reason: "unavailable",
      subscriberControlsPaused: true,
      pausedCameras: [],
    };
  }
  if (!session?.user)
    return { ...policy, canLoad: false, canManage: false, reason: "login" };
  if (canManagePresets(session))
    return { ...policy, canLoad: true, canManage: true, reason: null };
  if (!session.user.scopes.includes("user:read:subscriptions"))
    return {
      ...policy,
      canLoad: false,
      canManage: false,
      reason: "subscription-scope",
    };
  try {
    const account = await getUserTwitchAccount(session.user.id);
    const subscription = await getUserSubscribedToBroadcaster(
      account.token,
      account.id,
      channels.alveus.id,
      { signal: AbortSignal.timeout(5000), quiet: true },
    );
    return {
      ...policy,
      canLoad: Boolean(subscription) && !policy.subscriberControlsPaused,
      canManage: false,
      reason: subscription
        ? policy.subscriberControlsPaused
          ? "paused"
          : null
        : "subscription",
    };
  } catch (error) {
    return {
      ...policy,
      canLoad: false,
      canManage: false,
      reason:
        error instanceof ExpiredAccessTokenError ||
        (error instanceof TRPCError && error.code === "BAD_REQUEST")
          ? "subscription-scope"
          : "unavailable",
    };
  }
}
export async function authorizePresetAction(
  session: Session,
  action: string,
  camera: string,
): Promise<"operator" | "subscriber"> {
  if (canManagePresets(session)) return "operator";
  if (action !== "load")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Preset management requires camera operator access.",
    });
  const access = await presetAccess(session);
  if (access.canLoad && !access.pausedCameras.includes(camera))
    return "subscriber";
  if (access.reason === "unavailable")
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Subscription verification is temporarily unavailable. Try again shortly.",
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
