import type { TwitchConfig } from "@/config/twitch";
import { getTwitchConfig } from "@/config/twitch";
import type { StreamsResponse } from "../utils/twitch-api";
import { getStreamsForChannels } from "../utils/twitch-api";
import { prisma } from "../db/client";

const SERVICE_TWITCH = "twitch";
const EVENT_SOURCE_CRON_LIVE_CHECK = "cron-live-check";

type LiveStatusMap = Record<string, StreamsResponse["data"][number]>;

async function getChannelLiveStatus(id: string) {
  return await prisma.streamStatusEvent.findFirst({
    where: { service: SERVICE_TWITCH, channel: id },
    orderBy: { startedAt: "desc" },
  });
}

async function getCurrentChannelInfo(id: string) {
  return await prisma.channelUpdateEvent.findFirst({
    where: { service: SERVICE_TWITCH, channel: id },
    orderBy: { createdAt: "desc" },
  });
}

async function checkChannelForUpdates(
  id: string,
  liveStatusMap: LiveStatusMap
) {
  const oldStatus = await getChannelLiveStatus(id);

  if (oldStatus?.online === true) {
    const liveStatus = liveStatusMap[id];
    if (liveStatus) {
      const oldInfo = await getCurrentChannelInfo(id);
      if (
        !oldInfo ||
        oldInfo.title !== liveStatus.title ||
        oldInfo.category_id !== liveStatus.game_id
      ) {
        // Still live, channel info changed
        await prisma.channelUpdateEvent.create({
          data: {
            service: SERVICE_TWITCH,
            channel: id,
            source: EVENT_SOURCE_CRON_LIVE_CHECK,
            title: liveStatus.title,
            category_id: liveStatus.game_id,
            category_name: liveStatus.game_name,
          },
        });
      }
    } else {
      // Gone offline
      await prisma.streamStatusEvent.create({
        data: {
          service: SERVICE_TWITCH,
          channel: id,
          online: false,
          source: "cron-check",
        },
      });
    }
  } else {
    const liveStatus = liveStatusMap[id];
    if (liveStatus) {
      // Gone live
      await Promise.all([
        prisma.channelUpdateEvent.create({
          data: {
            service: SERVICE_TWITCH,
            channel: id,
            source: EVENT_SOURCE_CRON_LIVE_CHECK,
            title: liveStatus.title,
            category_id: liveStatus.game_id,
            category_name: liveStatus.game_name,
          },
        }),
        prisma.streamStatusEvent.create({
          data: {
            service: SERVICE_TWITCH,
            channel: id,
            online: true,
            startedAt: new Date(),
            source: EVENT_SOURCE_CRON_LIVE_CHECK,
          },
        }),
      ]);
    }
  }
}

async function checkLiveStatusForChannels() {
  const twitchConfig: TwitchConfig = await getTwitchConfig();
  const channelIds = [];

  for (const key in twitchConfig.channels) {
    const channelConfig = twitchConfig.channels[key];
    if (channelConfig !== undefined) {
      channelIds.push(String(channelConfig.id));
    }
  }

  if (!channelIds.length) {
    return;
  }

  const streams = await getStreamsForChannels(channelIds);
  const liveStatusMap: LiveStatusMap = {};
  streams.data.forEach((streamData) => {
    liveStatusMap[streamData.user_id] = streamData;
  });

  console.log("live status map", liveStatusMap);

  await Promise.allSettled(
    channelIds.map(
      async (id) => await checkChannelForUpdates(id, liveStatusMap)
    )
  );
}

export async function checkLiveStatus() {
  try {
    await checkLiveStatusForChannels();
  } catch (error) {
    console.error("Twitch Live Status: Error!", error);
  }
}
