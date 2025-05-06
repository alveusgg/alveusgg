import { prisma } from "@alveusgg/database";
import { type AccessTokenWithUserId } from "@twurple/auth";

const DEFAULT_ACCOUNT_PROVIDER = "twitch";

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
  return prisma.account.findFirst({
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
      access_token: newAccessToken.accessToken,
      expires_at: newAccessToken.expiresIn
        ? newAccessToken.expiresIn +
          Math.floor(newAccessToken.obtainmentTimestamp / 1000)
        : null,
      refresh_token: newAccessToken.refreshToken,
    },
  });
}
