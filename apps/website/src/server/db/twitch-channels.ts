import { env } from "@/env";

import { prisma } from "@/server/db/client";
import { refreshAccessToken } from "@/server/utils/oauth2";

export async function getTwitchChannels() {
  return prisma.twitchChannel.findMany({
    include: {
      broadcasterAccount: {
        include: {
          user: true,
        },
      },
      moderatorAccount: {
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
  const channels = await getTwitchChannels();
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
