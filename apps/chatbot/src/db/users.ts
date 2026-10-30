import { prisma } from "@alveusgg/database";
import { type AccessTokenWithUserId } from "@twurple/auth";

import { env } from "@/env";

import { fieldEncryption } from "@/utils/field-encryption";

const DEFAULT_ACCOUNT_PROVIDER = "twitch";

// Must match the contexts used by the website
const ACCESS_TOKEN = { model: "Account", field: "access_token" };
const REFRESH_TOKEN = { model: "Account", field: "refresh_token" };

export async function getUserRoles(userName: string) {
  return prisma.userRole
    .findMany({
      select: { role: true },
      where: { user: { name: userName } },
    })
    .then((userRoles) => userRoles.map(({ role }) => role));
}

export async function getAccountByProviderAccountId({
  provider = DEFAULT_ACCOUNT_PROVIDER,
  providerAccountId,
}: {
  provider?: string;
  providerAccountId: string;
}) {
  const account = await prisma.account.findFirst({
    select: {
      access_token: true,
      refresh_token: true,
      expires_at: true,
      scope: true,
    },
    where: {
      provider,
      providerAccountId,
    },
  });
  if (!account) return account;

  // TODO(201-cleanup): remove allowPlaintext once the OAuth token backfill has been run in production
  const [access_token, refresh_token] = await Promise.all([
    fieldEncryption.decryptOptional(account.access_token, ACCESS_TOKEN, {
      allowPlaintext: true,
    }),
    fieldEncryption.decryptOptional(account.refresh_token, REFRESH_TOKEN, {
      allowPlaintext: true,
    }),
  ]);
  return { ...account, access_token, refresh_token };
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
  const [access_token, refresh_token] = await Promise.all([
    env.OAUTH_TOKEN_ENCRYPTION_ENABLED
      ? fieldEncryption.encrypt(newAccessToken.accessToken, ACCESS_TOKEN)
      : newAccessToken.accessToken,
    env.OAUTH_TOKEN_ENCRYPTION_ENABLED
      ? fieldEncryption.encryptOptional(
          newAccessToken.refreshToken,
          REFRESH_TOKEN,
        )
      : newAccessToken.refreshToken,
  ]);
  return prisma.account.update({
    select: {
      id: true,
    },
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    data: {
      access_token,
      expires_at: newAccessToken.expiresIn
        ? newAccessToken.expiresIn +
          Math.floor(newAccessToken.obtainmentTimestamp / 1000)
        : null,
      refresh_token,
    },
  });
}
