import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
      roles: string[];
      emailVerified: boolean;
      twitch?: {
        id: string;
        scopes: string[];
        error?: "expired" | "unavailable";
        requiredScopes?: string[];
      };
      isSuperUser: boolean;
    } & DefaultSession["user"];
  }
}
