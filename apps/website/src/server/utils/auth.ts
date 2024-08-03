import type { Session } from "next-auth";

import { env } from "@/env";
import type { PermissionConfig } from "@/data/permissions";

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
