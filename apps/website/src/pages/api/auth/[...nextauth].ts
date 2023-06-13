import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "@/env/index.mjs";
import { prisma } from "@/server/db/client";
import { getRolesForUser } from "@/server/db/users";
import { checkIsSuperUserId } from "@/server/utils/auth";

const adapter = PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session: async function ({ session, user }) {
      return {
        ...session,
        user: session.user && {
          ...session.user,
          id: user.id,
          isSuperUser: checkIsSuperUserId(user.id),
          roles: await getRolesForUser(user.id),
        },
      };
    },
    async signIn({ user, account }) {
      if (user && account) {
        try {
          const userFromDatabase = await adapter.getUser(user.id);

          if (userFromDatabase) {
            await prisma.account.update({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              data: {
                access_token: account.access_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
                session_state: account.session_state,
                scope: account.scope,
              },
            });
          }
        } catch (err) {
          if (err instanceof Error) {
            console.error(err.message);
          }
        }
      }

      return true;
    },
  },
  adapter,
  providers: [
    // Configure one or more authentication providers
    TwitchProvider({
      clientId: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid user:read:email user:read:follows user:read:subscriptions",
        },
      },
    }),
    // ...add more providers here
  ],
  pages: {
    signIn: "/auth/signin",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

export default NextAuth(authOptions);
