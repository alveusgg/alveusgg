import { prisma } from "@/server/db/client";

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
