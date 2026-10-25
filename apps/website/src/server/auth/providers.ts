import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import TwitchProvider from "next-auth/providers/twitch";

import { env } from "@/env";

import { getVerifiedProviderEmail } from "@/server/auth/profiles";

import type { LoginProvider } from "@/data/auth";
import { scopeGroups } from "@/data/twitch";

const twitch = TwitchProvider({
  clientId: env.TWITCH_CLIENT_ID,
  clientSecret: env.TWITCH_CLIENT_SECRET,
  authorization: {
    params: {
      scope: scopeGroups.default.join(" "),
      claims: {
        id_token: {
          email: null,
          email_verified: null,
          picture: null,
          preferred_username: null,
        },
      },
    },
  },
  allowDangerousEmailAccountLinking: false,
});

export const enabledLoginProviders: LoginProvider[] = ["twitch"];
export const loginAuthProviders: NextAuthOptions["providers"] = [
  {
    ...twitch,
    async profile(profile, tokens) {
      return {
        ...(await twitch.profile(profile, tokens)),
        email: getVerifiedProviderEmail("twitch", profile),
      };
    },
  },
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  const google = GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: false,
  });
  enabledLoginProviders.push("google");
  loginAuthProviders.push({
    ...google,
    async profile(profile, tokens) {
      return {
        ...(await google.profile(profile, tokens)),
        email: getVerifiedProviderEmail("google", profile),
      };
    },
  });
}

if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
  const discord = DiscordProvider({
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: false,
  });
  enabledLoginProviders.push("discord");
  loginAuthProviders.push({
    ...discord,
    async profile(profile, tokens) {
      return {
        ...(await discord.profile(profile, tokens)),
        email: getVerifiedProviderEmail("discord", profile),
      };
    },
  });
}
