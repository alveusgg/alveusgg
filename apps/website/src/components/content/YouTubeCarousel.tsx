import { useState, useEffect } from "react";
import { Lightbox, Preview } from "@/components/content/YouTube";
import Heading from "@/components/content/Heading";
import { formatDateTime } from "@/utils/datetime";

type Video = {
  videoId: string;
  title: string;
  published: Date;
};

type YouTubeCarouselProps = {
  videos: Video[];
};

const YouTubeCarousel = ({ videos }: YouTubeCarouselProps) => {
  const [open, setOpen] = useState<string>();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (videos.some((video) => video.videoId === hash)) setOpen(hash);
  }, [videos]);

  return (
    <div className="flex justify-center">
      <Lightbox
        id="youtube-row"
        className="flex flex-wrap"
        value={open}
        onChange={setOpen}
      >
        {({ Trigger }) => (
          <div className="flex w-full flex-wrap justify-around">
            {videos.map((video) => (
              <div
                key={video.videoId}
                className="mx-auto flex basis-full flex-col items-center justify-start p-2 md:basis-1/2 lg:basis-1/4"
              >
                <Trigger
                  videoId={video.videoId}
                  caption={`${video.title}: ${formatDateTime(video.published, {
                    style: "long",
                  })}`}
                  triggerId={video.videoId}
                  className="w-full max-w-2xl"
                >
                  <Preview videoId={video.videoId} />
                </Trigger>
                <Heading
                  level={2}
                  id={video.videoId}
                  className="text-center text-2xl"
                >
                  {video.title}
                  <small className="block text-xl text-alveus-green-600">
                    {formatDateTime(video.published, { style: "long" })}
                  </small>
                </Heading>
              </div>
            ))}
          </div>
        )}
      </Lightbox>
    </div>
  );
};

export default YouTubeCarousel;
