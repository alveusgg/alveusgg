import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import type { PermissionConfig } from "@/data/permissions";

export function getSuperUserIds() {
  return env.SUPER_USER_IDS.split(",").map((id) => id.trim());
}

export function checkIsSuperUserId(id?: string) {
  if (env.NODE_ENV === "development" && env.DISABLE_ADMIN_AUTH) {
    return true;
  }

  if (!id) {
    return false;
  }

  const superUsers = getSuperUserIds();
  return superUsers.includes(id);
}

export function checkIsSuperUserSession(session: Session | null) {
  return checkIsSuperUserId(session?.user?.id);
}

export function checkPermissions(
  permissionConfig: PermissionConfig,
  user: Session["user"],
) {
  if (!user) {
    return false;
  }

  const isSuperUser = checkIsSuperUserId(user.id);
  if (isSuperUser) {
    return true;
  }

  if (!permissionConfig.requiresSuperUser && permissionConfig.requiredRole) {
    return user.roles.includes(permissionConfig.requiredRole);
  }

  return false;
}

export const getUserTwitchAccount = async (userId: string, trpc = true) => {
  const { access_token: token, providerAccountId: id } =
    (await prisma.account.findFirst({
      where: {
        userId,
        provider: "twitch",
      },
      select: {
        providerAccountId: true,
        access_token: true,
      },
    })) ?? {};
  if (!token || !id) {
    if (trpc) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Twitch account found for user",
      });
    }
    throw new Error("No Twitch account found for user");
  }
  return { token, id };
};
