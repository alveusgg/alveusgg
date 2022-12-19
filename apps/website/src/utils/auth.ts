import type { Session } from "next-auth";

import { env } from "../env/server.mjs";

export function checkIsSuperUser(session: Session | null) {
  if (!session?.user?.id) {
    return false;
  }

  const superUsers = env.SUPER_USER_IDS.split(",");
  return superUsers.includes(session.user.id);
}
