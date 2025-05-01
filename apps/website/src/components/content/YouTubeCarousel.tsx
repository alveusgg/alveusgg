import { useEffect, useState } from "react";

import type { YouTubeVideo } from "@/server/apis/youtube";

import { classes } from "@/utils/classes";
import { formatDateTime } from "@/utils/datetime";

import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import { Lightbox, Preview } from "@/components/content/YouTube";

type YouTubeCarouselProps = {
  videos: YouTubeVideo[];
  id?: string;
  dark?: boolean;
};

const YouTubeCarousel = ({ videos, id, dark }: YouTubeCarouselProps) => {
  const [open, setOpen] = useState<string>();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (videos.some((video) => video.id === hash)) setOpen(hash);
  }, [videos]);

  return (
    <div className="flex justify-center">
      <Lightbox
        id={id}
        className="flex flex-wrap"
        value={open}
        onChange={setOpen}
      >
        {({ Trigger }) => (
          <div className="flex w-full flex-wrap justify-around gap-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="mx-auto flex basis-full flex-col items-center justify-start p-2 md:basis-1/2 lg:basis-1/4"
              >
                <Heading
                  level={2}
                  className="order-3 my-0 px-1 text-center text-2xl"
                >
                  {video.title}
                </Heading>

                <Trigger
                  videoId={video.id}
                  caption={`${video.title}: ${formatDateTime(video.published, {
                    style: "long",
                  })}`}
                  className="order-1 w-full max-w-2xl"
                >
                  <Preview videoId={video.id} alt={video.title} />
                </Trigger>

                <div className="order-2 my-1 flex w-full flex-wrap items-center justify-between px-1">
                  <p
                    className={classes(
                      dark ? "text-alveus-green-200" : "text-alveus-green-600",
                      "text-sm leading-tight",
                    )}
                  >
                    {formatDateTime(video.published, { style: "long" })}
                  </p>
                  <Link
                    href={video.author.uri}
                    external
                    custom
                    className={classes(
                      dark
                        ? "bg-alveus-tan text-alveus-green-700"
                        : "bg-alveus-green text-alveus-tan",
                      "block rounded-full px-2 py-1 text-xs leading-tight transition-colors hover:bg-alveus-green-800 hover:text-alveus-tan",
                    )}
                  >
                    {video.author.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Lightbox>
    </div>
  );
};

export default YouTubeCarousel;
