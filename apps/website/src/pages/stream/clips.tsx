import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";

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

interface ClipData {
  id: string;
  title: string;
  creator: string;
  created: string;
  duration: number;
}

export const getStaticProps: GetStaticProps<{
  clips: ClipData[];
}> = async () => {
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
    console.error("No Twitch account found");
    return {
      props: {
        clips: [],
      },
      revalidate: 60, // revalidate after 1 minute
    };
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
  console.log(`Fetched ${clips.length} clips`);

  return {
    props: {
      clips: clips.map((clip) => ({
        id: clip.id,
        title: clip.title,
        creator: clip.creator_name,
        created: clip.created_at,
        duration: clip.duration,
      })),
    },
    revalidate: 1800, // revalidate after 30 minutes
  };
};

const getTwitchEmbed = (clip: string, parent: string): string => {
  const url = new URL("https://clips.twitch.tv/embed");
  url.searchParams.set("clip", clip);
  url.searchParams.set("parent", parent);
  url.searchParams.set("autoplay", "true");
  url.searchParams.set("muted", "false");
  url.searchParams.set("allowfullscreen", "false");
  url.searchParams.set("width", "100%");
  url.searchParams.set("height", "100%");
  return url.toString();
};

const ClipsPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  clips,
}) => {
  // Once mounted, randomize the clips
  const [randomClips, setRandomClips] = useState<ClipData[]>([]);
  useEffect(() => {
    setRandomClips(clips.slice().sort(() => Math.random() - 0.5));
  }, [clips]);

  const [idx, setIdx] = useState<number>(0);
  const clip = randomClips[idx];
  const increment = useCallback(
    () => setIdx((idx) => (idx + 1) % clips.length),
    [clips.length],
  );

  // As a fallback, set a timer for 150% of the duration of the clip
  const fallbackTimer = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    if (!clip) return;

    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    fallbackTimer.current = setTimeout(
      () => increment(),
      clip.duration * 1000 * 1.5,
    );
  }, [clip, increment]);

  // As soon as the clip loads, start a timer to randomize when the clip ends
  const loadedTimer = useRef<NodeJS.Timeout>(null);
  const onLoad = useCallback(() => {
    if (!clip) return;

    // We can clear the fallback timer as the clip has loaded
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);

    if (loadedTimer.current) clearTimeout(loadedTimer.current);
    loadedTimer.current = setTimeout(
      () => increment(),
      clip.duration * 1000 + 2 * 1000, // Fudge factor of 2 seconds for clip loading
    );
  }, [clip, increment]);

  // If the clip fails to load, randomize after 2 seconds
  const errorTimer = useRef<NodeJS.Timeout>(null);
  const onError = useCallback(() => {
    // Clear any other timers
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    if (loadedTimer.current) clearTimeout(loadedTimer.current);

    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => increment(), 2000);
  }, [increment]);

  // When we unmount, clear all timers
  useEffect(
    () => () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      if (loadedTimer.current) clearTimeout(loadedTimer.current);
      if (errorTimer.current) clearTimeout(errorTimer.current);
    },
    [],
  );

  return (
    <div className="flex h-screen w-full">
      {clip && (
        <div className="relative my-auto aspect-video h-auto w-full">
          <div className="absolute left-2 top-2 rounded-lg bg-black/25 px-4 py-2 text-white backdrop-blur">
            <h1 className="text-4xl">
              {clip.title}
              <span className="ml-1 text-2xl">
                {" "}
                (
                {new Date(clip.created).toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
                )
              </span>
            </h1>
            <p className="text-xl">Clipped by {clip.creator}</p>
          </div>
          <iframe
            src={getTwitchEmbed(clip.id, window.location.hostname)}
            onLoad={onLoad}
            onError={onError}
            className="size-full rounded"
          />
        </div>
      )}
    </div>
  );
};

export default ClipsPage;
