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

const adapter = PrismaAdapter(prisma);

const twitchProvider = TwitchProvider({
  clientId: env.TWITCH_CLIENT_ID,
  clientSecret: env.TWITCH_CLIENT_SECRET,
  authorization: {
    params: {
      scope: scopeGroups.default.join(" "),
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
      // Twitch is an optional connection. Its authorization status must not
      // invalidate the website session or the user's Alveus roles.
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: "twitch" },
        select: {
          id: true,
          providerAccountId: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
          verified_at: true,
          scope: true,
          twitchChannelBroadcaster: { select: { channelId: true } },
          twitchChannelModerator: { select: { channelId: true } },
        },
      });
      let twitch: NonNullable<typeof session.user>["twitch"];
      if (account) {
        twitch = {
          id: account.providerAccountId,
          scopes: account.scope?.split(" ").filter(Boolean) ?? [],
        };
        if (!account.access_token) {
          twitch.error = "expired";
        } else if (
          account.refresh_token &&
          (!account.verified_at ||
            account.verified_at < Date.now() / 1000 - 60 * 60 ||
            (account.expires_at &&
              account.expires_at < Date.now() / 1000 + 60 * 60))
        ) {
          try {
            await refreshAccessToken(
              "twitch",
              env.TWITCH_CLIENT_ID,
              env.TWITCH_CLIENT_SECRET,
              account.id,
              account.access_token,
              account.refresh_token,
              !!(
                account.expires_at &&
                account.expires_at - Date.now() / 1000 < 60 * 60
              ),
            );
          } catch (err) {
            twitch.error =
              err instanceof ExpiredAccessTokenError
                ? "expired"
                : "unavailable";
          }
        } else if (
          account.expires_at &&
          account.expires_at < Date.now() / 1000
        ) {
          twitch.error = "expired";
        }
        if (twitch.error) twitch.scopes = [];
        if (
          account.twitchChannelBroadcaster.length ||
          account.twitchChannelModerator.length
        ) {
          const grantedScopes = twitch.scopes;
          twitch.requiredScopes = scopeGroups.api.filter(
            (scope) => !grantedScopes.includes(scope),
          );
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
          twitch,
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
  providers: [twitchProvider],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Error code passed in query string as ?error=
  },
  cookies: {
    // Set SameSite=none for the session cookie so it can be embedded in an iframe
    // https://github.com/nextauthjs/next-auth/blob/next-auth%404.24.11/packages/next-auth/src/core/lib/cookie.ts#L57-L68
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
};

export default NextAuth(authOptions);
