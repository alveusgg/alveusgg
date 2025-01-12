import type { InferGetStaticPropsType, NextPage } from "next";

import { type Clip, getClips } from "@/server/apis/twitch";
import { prisma } from "@/server/db/client";

import { twitchChannels } from "@/data/calendar-events";

async function getTwitchClips(
  userAccessToken: string,
  userId: string,
  start: Date,
  end: Date,
  views: number,
) {
  let cursor;
  const clips: Clip[] = [];

  while (true) {
    const response = await getClips(
      userAccessToken,
      userId,
      start,
      end,
      cursor,
    );
    if (response === null) break;

    // Filter the clips by the minimum number of views
    const filtered = response.data.filter((clip) => clip.view_count > views);
    clips.push(...filtered);

    // Twitch guarantees clips are returned in descending order of view count
    // So, if we have a clip with less views than the minimum, we can stop
    if (filtered.length !== response.data.length) break;

    cursor = response.pagination.cursor;
    if (!cursor) break;
  }

  return clips;
}

export const getStaticProps = async () => {
  // Get auth for the Twitch account
  const twitchChannel = await prisma.twitchChannel.findFirst({
    where: { username: twitchChannels.alveus.username },
    select: {
      broadcasterAccount: {
        select: {
          access_token: true,
        },
      },
    },
  });
  if (!twitchChannel?.broadcasterAccount?.access_token) {
    throw new Error(`No access token found for Twitch account`);
  }

  // Get clips within the last year, older than a week, with at least 100 views
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const end = new Date();
  end.setDate(end.getDate() - 7);
  const clips = await getTwitchClips(
    twitchChannel.broadcasterAccount.access_token,
    twitchChannels.alveus.id,
    start,
    end,
    100,
  );
  console.log(clips[0], clips.length);

  return {
    props: {
      clips: clips.map((clip) => ({
        url: clip.embed_url,
        title: clip.title,
        creator: clip.creator_name,
        created: clip.created_at,
        duration: clip.duration,
      })),
    },
    revalidate: 1800, // revalidate after 30 minutes
  };
};

const ClipsPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  clips,
}) => {
  return null;
};

export default ClipsPage;
