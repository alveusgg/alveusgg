import { Transition } from "@headlessui/react";
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { type Clip, getClips } from "@/server/apis/twitch";

import { channels } from "@/data/twitch";

import { queryArray } from "@/utils/array";

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
  try {
    // Get auth for the Twitch account
    const twitchChannel = await prisma.twitchChannel.findFirst({
      where: { username: channels.alveus.username },
      select: {
        broadcasterAccount: {
          select: {
            access_token: true,
          },
        },
      },
    });
    if (!twitchChannel?.broadcasterAccount?.access_token) {
      throw new Error("No Twitch account found");
    }

    // Get clips within the last year, older than a week, with at least 100 views
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    const end = new Date();
    end.setDate(end.getDate() - 7);
    const clips = await getTwitchClips(
      twitchChannel.broadcasterAccount.access_token,
      channels.alveus.id,
      start,
      end,
      100,
    );
    console.log(`Fetched ${clips.length} clips`);

    // Filter out any clips marked to be excluded
    const excluded = new Set(env.TWITCH_EXCLUDED_CLIPS);
    const excludedTitlePhrases = [
      "animal ambassador 24/7", // Exclude default title clips
      "seizure",
      "concern",
      "for staff",
      " nilla",
    ];

    const filtered = clips.filter(
      (clip) =>
        !excluded.has(clip.id) &&
        !excludedTitlePhrases.some((phrase) =>
          clip.title.toLowerCase().includes(phrase),
        ),
    );
    console.log(`Filtered ${clips.length - filtered.length} clips`);

    return {
      props: {
        clips: filtered.map((clip) => ({
          id: clip.id,
          title: clip.title,
          creator: clip.creator_name,
          created: clip.created_at,
          duration: clip.duration,
        })),
      },
      revalidate: 1800, // revalidate after 30 minutes
    };
  } catch (error) {
    console.error("Failed to fetch clips", error);
    return {
      props: {
        clips: [],
      },
      revalidate: 60, // revalidate after 1 minute
    };
  }
};

const getTwitchEmbed = (clip: string, parents: string[]): string => {
  const url = new URL("https://clips.twitch.tv/embed");
  url.searchParams.set("clip", clip);
  parents.forEach((parent) => url.searchParams.append("parent", parent));
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
  const { query } = useRouter();
  const parents = useMemo(() => queryArray(query.parent), [query.parent]);

  // Once mounted, randomize the clips
  const [randomClips, setRandomClips] = useState<ClipData[]>([]);
  useEffect(() => {
    const shuffled = clips.slice();
    for (let i = shuffled.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    setRandomClips(shuffled);
  }, [clips]);

  // Iterate through clips
  const [details, setDetails] = useState<"overlay" | "below">();
  const [idx, setIdx] = useState<number>(0);
  const clip = randomClips[idx];
  const increment = useCallback(() => {
    setIdx((idx) => (idx + 1) % clips.length);
    setDetails(undefined);
  }, [clips.length]);

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

  // As soon as the clip loads, start a timer for when the clip ends
  // Also, after a short while, hide the details of the clip
  const loadedTimer = useRef<NodeJS.Timeout>(null);
  const detailsTimer = useRef<NodeJS.Timeout>(null);
  const onLoad = useCallback(() => {
    if (!clip) return;

    // We can clear the fallback timer as the clip has loaded
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);

    if (loadedTimer.current) clearTimeout(loadedTimer.current);
    loadedTimer.current = setTimeout(
      () => increment(),
      clip.duration * 1000 + 2 * 1000, // Fudge factor of 2 seconds for clip loading
    );

    // After 1s overlay the clip details, and 10s later place them below the clip
    if (detailsTimer.current) clearTimeout(detailsTimer.current);
    detailsTimer.current = setTimeout(() => {
      setDetails("overlay");

      detailsTimer.current = setTimeout(() => {
        setDetails("below");
      }, 10000);
    }, 1000);
  }, [clip, increment]);

  // If the clip fails to load, show another after 2 seconds
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
      if (detailsTimer.current) clearTimeout(detailsTimer.current);
      if (errorTimer.current) clearTimeout(errorTimer.current);
    },
    [],
  );

  return (
    <div className="flex h-screen w-full items-center justify-center p-20">
      {clip && (
        <div className="flex aspect-video h-full max-w-full items-center justify-center">
          <div className="relative flex aspect-video w-full items-center justify-center">
            <div className="absolute -inset-2 -z-10 rounded-xl bg-alveus-green shadow-lg" />

            <Transition show={details === "overlay"}>
              <div className="absolute top-2 left-2 rounded-lg bg-black/25 px-4 py-2 text-white backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-300">
                <h1 className="text-5xl">
                  {clip.title}
                  <span className="ml-1 text-4xl">
                    {" "}
                    (
                    {new Date(clip.created).toLocaleDateString(undefined, {
                      dateStyle: "long",
                    })}
                    )
                  </span>
                </h1>
                <p className="text-2xl">Clipped by {clip.creator}</p>
              </div>
            </Transition>

            <iframe
              src={getTwitchEmbed(clip.id, [
                window.location.hostname,
                ...parents,
              ])}
              onLoad={onLoad}
              onError={onError}
              className="size-full rounded-lg"
            />

            <Transition show={details === "below"}>
              {/* data-[leave]:duration-0 to ensure the next clip's details aren't show */}
              <div className="absolute -bottom-4 left-0 flex translate-y-full items-center gap-2 rounded-lg bg-black/25 px-2 py-1 text-white transition-opacity data-[closed]:opacity-0 data-[enter]:duration-700 data-[leave]:duration-0">
                <p className="text-lg">{clip.title}</p>
                <div className="mt-0.5 h-0.5 w-2 rounded-xs bg-white" />
                <p>
                  {new Date(clip.created).toLocaleDateString(undefined, {
                    dateStyle: "long",
                  })}
                </p>
                <div className="mt-0.5 h-0.5 w-2 rounded-xs bg-white" />
                <p>Clipped by {clip.creator}</p>
              </div>
            </Transition>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClipsPage;
