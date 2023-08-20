import { RefreshingAuthProvider, StaticAuthProvider } from "@twurple/auth";

import { getAccountByProviderAccountId, updateAccessToken } from "@/db/users";
import { env } from "@/env";

let authProvider: RefreshingAuthProvider | StaticAuthProvider;
export async function getAuthProvider() {
  if (!authProvider) {
    authProvider = await createAuthProvider();
  }

  return authProvider;
}

async function createAuthProvider() {
  const botAccount = await getAccountByProviderAccountId({
    providerAccountId: env.BOT_USER_ID,
  });
  if (!botAccount) {
    throw new Error("No bot account found");
  }

  const { accessToken, refreshToken, expiresAt } = botAccount;
  if (!accessToken) {
    throw new Error("No access token found");
  }

  const scope = botAccount.scope?.split(" ") || ["chat:read", "chat:edit"];

  let authProvider: RefreshingAuthProvider | StaticAuthProvider;

  if (refreshToken && expiresAt) {
    authProvider = new RefreshingAuthProvider({
      clientId: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
    });

    const obtainmentTimestamp = Math.floor(Date.now() / 1000);
    await authProvider.addUserForToken(
      {
        accessToken,
        refreshToken,
        scope: scope,
        expiresIn: expiresAt - obtainmentTimestamp,
        obtainmentTimestamp,
      },
      ["chat"],
    );

    const newAccessToken = await authProvider.getAccessTokenForUser(
      env.BOT_USER_ID,
    );
    if (!newAccessToken) {
      throw new Error("No new access token found");
    }

    if (newAccessToken.accessToken !== accessToken) {
      console.log("Got a new access token, updating database");
      updateAccessToken({
        providerAccountId: env.BOT_USER_ID,
        newAccessToken,
      }).then(() => {
        console.log("Updated access token in database");
      });
    }
  } else {
    authProvider = new StaticAuthProvider(
      env.TWITCH_CLIENT_ID,
      accessToken,
      scope,
    );
  }

  return authProvider;
}
