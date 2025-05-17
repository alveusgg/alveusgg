import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import TwitchProvider, { type TwitchProfile } from "next-auth/providers/twitch";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { getRolesForUser } from "@/server/db/users";
import { checkIsSuperUserId } from "@/server/utils/auth";
import {
  ExpiredAccessTokenError,
  refreshAccessToken,
} from "@/server/utils/oauth2";

import { scopeGroups } from "@/data/twitch";

import invariant from "@/utils/invariant";

const requireScopes = (account: { scope: string | null }, scopes: string[]) => {
  const accountScopes = new Set(account.scope?.split(" "));
  const missingScopes = scopes.filter((scope) => !accountScopes.has(scope));

  if (missingScopes.length > 0) {
    const allScopes = [...accountScopes, ...missingScopes].join(" ");
    return {
      expires: new Date(0).toISOString(),
      error: `Additional scopes required: ${allScopes}`,
    };
  }

  return null;
};

const adapter = PrismaAdapter(prisma);

const twitchProvider = TwitchProvider({
  clientId: env.TWITCH_CLIENT_ID,
  clientSecret: env.TWITCH_CLIENT_SECRET,
  authorization: {
    params: {
      scope: scopeGroups.default.scopes.join(" "),
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
      // Find the full account for the user
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: "twitch" },
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          verified_at: true,
          scope: true,
          twitchChannelBroadcaster: {
            select: { channelId: true },
          },
          twitchChannelModerator: {
            select: { channelId: true },
          },
        },
      });
      if (!account) {
        return {
          expires: new Date(0).toISOString(),
          error: "Account not found",
        };
      }

      // If we're over an hour since we last verified the Twitch token, check it
      if (account.access_token && account.refresh_token) {
        if (
          !account.verified_at ||
          account.verified_at < Math.floor(Date.now() / 1000) - 60 * 60
        ) {
          try {
            await refreshAccessToken(
              "twitch",
              env.TWITCH_CLIENT_ID,
              env.TWITCH_CLIENT_SECRET,
              account.id,
              account.access_token,
              account.refresh_token,
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

      // Check if we need to ask the client to re-authenticate with additional scopes
      // Accounts tied to channels in the DB need more scopes for API access
      if (
        account.twitchChannelBroadcaster.length ||
        account.twitchChannelModerator.length
      ) {
        const err = requireScopes(account, scopeGroups.api.scopes);
        if (err) return err;
      }

      // Include user.id on session
      return {
        ...session,
        user: session.user && {
          ...session.user,
          id: user.id,
          isSuperUser: checkIsSuperUserId(user.id),
          roles: await getRolesForUser(user.id),
          scopes: account.scope?.split(" ") ?? [],
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
