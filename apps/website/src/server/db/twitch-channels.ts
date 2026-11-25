import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { refreshAccessToken } from "@/server/utils/oauth2";

import { channels } from "@/data/twitch";

/**
 * The account that posts the website's chat messages, like pixel and wishlist
 * donations, in every channel: the channel picked as the chat bot in the
 * Twitch admin, or AlveusGG while none is picked
 */
export async function getChatBotAccount() {
  const chatBot = await prisma.twitchChannel.findFirst({
    where: { isChatBot: true },
    select: { channelId: true },
  });
  const userId = chatBot?.channelId ?? channels.alveusgg.id;

  const account = await prisma.account.findFirst({
    where: {
      provider: "twitch",
      providerAccountId: userId,
    },
    select: {
      access_token: true,
    },
  });

  if (!account?.access_token) {
    throw new Error(`No Twitch account found for chat bot ${userId}`);
  }

  return { userId, accessToken: account.access_token };
}

// Whether the channel's own account signed in with the scope to send chat
export async function canPostAsChatBot(channelId: string) {
  const account = await prisma.account.findFirst({
    where: {
      provider: "twitch",
      providerAccountId: channelId,
      access_token: { not: null },
      scope: { contains: "user:write:chat" },
    },
    select: { id: true },
  });
  return account !== null;
}

// Picks the chat bot channel, or none to post as AlveusGG
export async function setChatBotChannel(channelId: string | null) {
  await prisma.$transaction([
    prisma.twitchChannel.updateMany({
      where: { isChatBot: true },
      data: { isChatBot: false },
    }),
    ...(channelId
      ? [
          prisma.twitchChannel.update({
            where: { channelId },
            data: { isChatBot: true },
          }),
        ]
      : []),
  ]);
}

export async function getTwitchChannels() {
  return prisma.twitchChannel.findMany({
    include: {
      // This is sent to the admin UI, so leave out the tokens
      broadcasterAccount: {
        omit: { access_token: true, refresh_token: true, id_token: true },
        include: {
          user: true,
        },
      },
      moderatorAccount: {
        omit: { access_token: true, refresh_token: true, id_token: true },
        include: {
          user: true,
        },
      },
    },
  });
}

export async function createTwitchChannel({
  channelId,
  username,
  label = username,
}: {
  channelId: string;
  username: string;
  label: string;
}) {
  return prisma.twitchChannel.create({
    data: {
      channelId,
      username,
      label,
    },
  });
}

export async function editTwitchChannel(
  channelId: string,
  { label }: { label?: string },
) {
  return prisma.twitchChannel.update({
    where: { channelId },
    data: { label },
  });
}

export async function deleteTwitchChannel(channelId: string) {
  return prisma.twitchChannel.delete({
    where: { channelId },
  });
}

export async function refreshTwitchChannels() {
  const channels = await prisma.twitchChannel.findMany({
    include: {
      broadcasterAccount: true,
      moderatorAccount: true,
    },
  });
  const accounts = channels
    .map((channel) => [channel.broadcasterAccount, channel.moderatorAccount])
    .flat();

  const seen = new Set<string>();
  for (const account of accounts) {
    // Handle a channel not having a linked account
    if (!account) continue;

    // Handle a tied account not having tokens for some reason
    if (!account.access_token || !account.refresh_token) {
      console.log(
        `Skipping refresh for ${account.id} - missing access token or refresh token`,
      );
      continue;
    }

    // Handle the same account being tied to multiple channels
    if (seen.has(account.id)) continue;
    seen.add(account.id);

    await refreshAccessToken(
      "twitch",
      env.TWITCH_CLIENT_ID,
      env.TWITCH_CLIENT_SECRET,
      account.id,
      account.access_token,
      account.refresh_token,
      // Force the refresh if we're within 1hr of expiry
      !!(
        account.expires_at && account.expires_at - Date.now() / 1000 < 60 * 60
      ),
    ).catch((err) => {
      console.error(
        `Error refreshing access token for account ${account.id}:`,
        err,
      );
    });
  }
}
