import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import type { TwitchProfile } from "next-auth/providers/twitch";
import TwitchProvider from "next-auth/providers/twitch";

import { defaultScope } from "@/data/twitch";
import { env } from "@/env";
import { prisma } from "@/server/db/client";
import { getRolesForUser } from "@/server/db/users";
import { checkIsSuperUserId } from "@/server/utils/auth";

const adapter = PrismaAdapter(prisma);

const twitchProvider = TwitchProvider({
  clientId: env.TWITCH_CLIENT_ID,
  clientSecret: env.TWITCH_CLIENT_SECRET,
  authorization: {
    params: {
      scope: defaultScope,
    },
  },
});

type ProfileData = {
  name: string;
  image?: string | null;
};

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session: async ({ session, user }) => ({
      ...session,
      user: session.user && {
        ...session.user,
        id: user.id,
        isSuperUser: checkIsSuperUserId(user.id),
        roles: await getRolesForUser(user.id),
      },
    }),
    async signIn({ user, account, profile }) {
      if (!user || !account) return true;

      try {
        const userFromDatabase = await adapter.getUser?.(user.id);
        if (!userFromDatabase) return true;

        let profileData: ProfileData | undefined;
        if (account.provider === "twitch") {
          const { name, image } = await twitchProvider.profile(
            profile as TwitchProfile,
            {},
          );
          if (name) {
            profileData = { name, image };
          }
        }

        await Promise.all([
          // Update tokens
          prisma.account.update({
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
          }),
          // Update username/image if it changed
          profileData &&
            (userFromDatabase.name !== profileData.name ||
              userFromDatabase.image !== profileData.image) &&
            prisma.user.update({
              where: { id: userFromDatabase.id },
              data: {
                name: profileData.name,
                image: profileData.image,
              },
            }),
        ]);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }

      return true;
    },
  },
  adapter,
  providers: [
    // Configure one or more authentication providers
    twitchProvider,
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
