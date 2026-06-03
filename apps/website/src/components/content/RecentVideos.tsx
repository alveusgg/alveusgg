import { type ReactNode, useMemo, useState } from "react";

import { formatDateTime } from "@/utils/datetime";

import Heading from "@/components/content/Heading";
import Lightbox from "@/components/content/Lightbox";
import Link from "@/components/content/Link";
import Section from "@/components/content/Section";
import { YouTubeEmbed, YouTubePreview } from "@/components/content/YouTube";

// Minimal shape this section needs (a structural subset of the server's
// YouTubeVideo) so this content component stays decoupled from the server layer.
export type RecentVideo = {
  id: string;
  title: string;
  published: Date;
  author: { name: string; uri: string };
};

const RecentVideos = ({
  heading,
  videos,
}: {
  heading: string;
  videos: RecentVideo[];
}) => {
  const [open, setOpen] = useState<string>();

  const items = useMemo(
    () =>
      videos.reduce<Record<string, ReactNode>>(
        (acc, video) => ({
          ...acc,
          [video.id]: (
            <YouTubeEmbed
              videoId={video.id}
              caption={`${video.title}: ${formatDateTime(video.published, { style: "long" })}`}
            />
          ),
        }),
        {},
      ),
    [videos],
  );

  // Matches the current home: the section is absent when there are no videos.
  if (videos.length === 0) return null;

  return (
    <Section dark>
      <Heading level={2} id="recent-videos" link>
        {heading}
      </Heading>

      <div className="mt-8 flex w-full flex-wrap justify-around gap-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="mx-auto flex basis-full flex-col items-center justify-start p-2 md:basis-1/2 lg:basis-1/4"
          >
            <Heading level={2} className="order-3 my-0 px-1 text-center text-2xl">
              {video.title}
            </Heading>

            <Link
              href={`https://www.youtube.com/watch?v=${video.id}`}
              external
              onClick={(e) => {
                e.preventDefault();
                setOpen(video.id);
              }}
              className="group/trigger order-1 w-full max-w-2xl"
              custom
            >
              <YouTubePreview
                videoId={video.id}
                alt={video.title}
                className="aspect-video h-auto w-full"
              />
            </Link>

            <div className="order-2 my-1 flex w-full flex-wrap items-center justify-between px-1">
              <p className="text-sm/tight text-alveus-green-200">
                {formatDateTime(video.published, { style: "long" })}
              </p>
              <Link
                href={video.author.uri}
                external
                custom
                className="block rounded-full bg-alveus-tan px-2 py-1 text-xs/tight text-alveus-green-700 transition-colors hover:bg-alveus-green-800 hover:text-alveus-tan"
              >
                {video.author.name}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Lightbox open={open} onClose={() => setOpen(undefined)} items={items} />
    </Section>
  );
};

export default RecentVideos;
