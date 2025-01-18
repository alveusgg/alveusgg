import { type Session } from "next-auth";

export const DEV_ADMIN_SESSION: Session = {
  user: {
    id: "dev-admin",
    roles: [] as string[],
    isSuperUser: true,
  },
  expires: "2090-01-01T00:00:00.000Z",
};
