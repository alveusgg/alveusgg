import NextAuth, { type NextAuthOptions } from "next-auth";
import type { TwitchProfile } from "next-auth/providers/twitch";
import TwitchProvider from "next-auth/providers/twitch";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "@/env";
import { prisma } from "@/server/db/client";
import { getRolesForUser } from "@/server/db/users";
import { checkIsSuperUserId } from "@/server/utils/auth";
import {
  ExpiredAccessTokenError,
  refreshAccessToken,
} from "@/server/utils/oauth2";
import { defaultScopes } from "@/data/twitch";
import invariant from "@/utils/invariant";

const adapter = PrismaAdapter(prisma);

const twitchProvider = TwitchProvider({
  clientId: env.TWITCH_CLIENT_ID,
  clientSecret: env.TWITCH_CLIENT_SECRET,
  authorization: {
    params: {
      scope: defaultScopes.join(" "),
    },
  },
});

type ProfileData = {
  name: string;
  image?: string | null;
};

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async function ({ session, user }) {
      // If we're over an hour since we last verified the Twitch token, check it
      const token = await prisma.account.findFirst({
        where: { userId: user.id, provider: "twitch" },
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          verified_at: true,
        },
      });
      if (token?.access_token && token?.refresh_token) {
        if (
          !token.verified_at ||
          token.verified_at < Math.floor(Date.now() / 1000) - 60 * 60
        ) {
          try {
            await refreshAccessToken(
              "twitch",
              env.TWITCH_CLIENT_ID,
              env.TWITCH_CLIENT_SECRET,
              token.id,
              token.access_token,
              token.refresh_token,
            );
          } catch (err) {
            if (!(err instanceof ExpiredAccessTokenError)) console.error(err);
            return {
              expires: new Date(0).toISOString(),
              error: "Twitch auth expired",
            };
          }
        }
      }

      // Include user.id on session
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
    async signIn({ user, account, profile }) {
      try {
        invariant(
          account?.provider === "twitch",
          "Must be authenticating with Twitch",
        );

        // Check if the user has signed in before
        // If they haven't, we don't need to do anything
        const userFromDatabase = await adapter.getUser?.(user.id);
        if (!userFromDatabase) return true;

        // Otherwise, we want to update their profile data
        // And we'll also store the new tokens
        const { name, image } = await twitchProvider.profile(
          profile as TwitchProfile,
          {},
        );
        const profileData: ProfileData | undefined = name
          ? { name, image }
          : undefined;

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
              verified_at: Math.floor(Date.now() / 1000),
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

        return true;
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }

        return false;
      }
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
    error: "/auth/signin", // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

export default NextAuth(authOptions);
