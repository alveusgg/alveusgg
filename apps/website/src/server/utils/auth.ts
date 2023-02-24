import type { Session } from "next-auth";

import { env } from "../../env/server.mjs";

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
