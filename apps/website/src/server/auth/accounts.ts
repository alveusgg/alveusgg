import type { PrismaAdapter } from "@auth/prisma-adapter";
import { TRPCError } from "@trpc/server";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

const accountSummary = {
  id: true,
  provider: true,
  providerAccountId: true,
  _count: {
    select: { twitchChannelBroadcaster: true, twitchChannelModerator: true },
  },
} as const;

function isProtected(account: {
  provider: string;
  providerAccountId: string;
  _count: { twitchChannelBroadcaster: number; twitchChannelModerator: number };
}) {
  return (
    account.provider === "twitch" &&
    (env.PROTECTED_TWITCH_ACCOUNT_IDS.includes(account.providerAccountId) ||
      account._count.twitchChannelBroadcaster > 0 ||
      account._count.twitchChannelModerator > 0)
  );
}

export async function getConnectedAccounts(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: accountSummary,
    orderBy: [{ provider: "asc" }, { id: "asc" }],
  });
  return accounts.map(({ _count, ...account }) => ({
    ...account,
    protected: isProtected({ ...account, _count }),
  }));
}

/**
 * Link/unlink operations lock the same user row to serialize decisions about
 * the last login method and multiple accounts from one provider.
 * Token transforms (including #201 encryption) wrap this adapter on the outside.
 */
export function withAccountLinkPolicy(
  adapter: ReturnType<typeof PrismaAdapter>,
): ReturnType<typeof PrismaAdapter> {
  return {
    ...adapter,
    linkAccount: async (account) => {
      await prisma.$transaction(async (tx) => {
        const users = await tx.$queryRaw<
          { id: string }[]
        >`SELECT id FROM User WHERE id = ${account.userId} FOR UPDATE`;
        if (!users.length) throw new Error("User not found");
        const existing = await tx.account.findFirst({
          where: { userId: account.userId, provider: account.provider },
        });
        if (existing) {
          if (existing.providerAccountId === account.providerAccountId) return;
          throw new Error("An account from this provider is already connected");
        }
        await tx.account.create({ data: account });
      });
    },
  };
}

export async function disconnectAccount(
  userId: string,
  accountId: string,
  enabledProviders: string[],
  currentSessionToken?: string,
) {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
    const accounts = await tx.account.findMany({
      where: { userId },
      select: accountSummary,
    });
    const account = accounts.find((account) => account.id === accountId);
    if (!account)
      throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
    if (isProtected(account))
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "This Twitch account is used by an integration. Ask an administrator to disconnect it.",
      });
    if (
      !accounts.some(
        (other) =>
          other.id !== accountId && enabledProviders.includes(other.provider),
      )
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "Connect another login method before disconnecting this account.",
      });
    }
    await tx.account.delete({ where: { id: accountId, userId } });
    // Sessions belong to the Alveus user rather than an individual provider.
    // Revoke other sessions so a removed login cannot retain website access.
    await tx.session.deleteMany({
      where: {
        userId,
        ...(currentSessionToken && {
          sessionToken: { not: currentSessionToken },
        }),
      },
    });
  });
}
