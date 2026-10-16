import { type Session } from "next-auth";

import { scopeGroups } from "@/data/twitch";

export const DEV_ADMIN_SESSION: Session = {
  user: {
    id: "dev-admin",
    roles: [] as string[],
    scopes: scopeGroups.default,
    isSuperUser: true,
  },
  expires: "2090-01-01T00:00:00.000Z",
};
