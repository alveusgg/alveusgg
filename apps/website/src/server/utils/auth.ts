import type { Session } from "next-auth";

import { env } from "@/env/index.mjs";
import type { PermissionConfig } from "@/config/permissions";
import { getRolesForUser } from "@/server/db/users";

export function getSuperUserIds() {
  return env.SUPER_USER_IDS.split(",").map((id) => id.trim());
}

export function checkIsSuperUserId(id?: string) {
  if (!id) {
    return false;
  }

  const superUsers = getSuperUserIds();
  return superUsers.includes(id);
}

export function checkIsSuperUserSession(session: Session | null) {
  return checkIsSuperUserId(session?.user?.id);
}

export async function checkPermissions(
  permissionConfig: PermissionConfig,
  userId?: string,
) {
  if (!userId) {
    return false;
  }

  const isSuperUser = checkIsSuperUserId(userId);
  if (isSuperUser) {
    return true;
  }

  if (!permissionConfig.requiresSuperUser && permissionConfig.requiredRole) {
    return (await getRolesForUser(userId)).includes(
      permissionConfig.requiredRole,
    );
  }

  return false;
}
