import { and, eq } from "drizzle-orm";
import { type AccessTokenWithUserId } from "@twurple/auth";

import { getDatabase } from "@/db/index";
import { accounts, userRoles, users, type Account } from "@/db/schema";

const DEFAULT_ACCOUNT_PROVIDER = "twitch";

export async function getUserRoles(userName: string): Promise<Array<string>> {
  const db = await getDatabase();

  return (
    await db
      .select({
        role: userRoles.role,
      })
      .from(userRoles)
      .innerJoin(users, eq(users.id, userRoles.userId))
      .where(eq(users.name, userName))
  ).map(({ role }) => role);
}

export type UserAccount = {
  accessToken: Account["access_token"];
  refreshToken: Account["refresh_token"];
  expiresAt: Account["expires_at"];
  scope: Account["scope"];
};

export async function getAccountByProviderAccountId({
  provider = DEFAULT_ACCOUNT_PROVIDER,
  providerAccountId,
}: {
  provider?: string;
  providerAccountId: string;
}): Promise<UserAccount | undefined> {
  const db = await getDatabase();

  const foundAccounts = await db
    .select({
      accessToken: accounts.access_token,
      refreshToken: accounts.refresh_token,
      expiresAt: accounts.expires_at,
      scope: accounts.scope,
    })
    .from(accounts)
    .limit(1)
    .where(
      and(
        eq(accounts.provider, provider),
        eq(accounts.providerAccountId, providerAccountId),
      ),
    );
  return foundAccounts[0];
}

export async function updateAccessToken({
  provider = DEFAULT_ACCOUNT_PROVIDER,
  providerAccountId,
  newAccessToken,
}: {
  provider?: string;
  providerAccountId: string;
  newAccessToken: AccessTokenWithUserId;
}) {
  const db = await getDatabase();

  await db
    .update(accounts)
    .set({
      access_token: newAccessToken.accessToken,
      expires_at: newAccessToken.expiresIn
        ? newAccessToken.expiresIn +
          Math.floor(newAccessToken.obtainmentTimestamp / 1000)
        : null,
      refresh_token: newAccessToken.refreshToken,
    })
    .where(
      and(
        eq(accounts.provider, provider),
        eq(accounts.providerAccountId, providerAccountId),
      ),
    );
}
