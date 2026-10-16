import { type Session } from "next-auth";

import { scopeGroups } from "@/data/twitch";

export const DEV_ADMIN_USER_ID = "dev-admin";

export const DEV_ADMIN_SESSION: Session = {
  user: {
    id: DEV_ADMIN_USER_ID,
    roles: [] as string[],
    scopes: scopeGroups.default,
    isSuperUser: true,
  },
  expires: "2090-01-01T00:00:00.000Z",
};
