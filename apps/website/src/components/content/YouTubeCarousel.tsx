import type { FC} from "react";
import { useState, useEffect } from "react";
import { Lightbox, Preview } from "@/components/content/YouTube";
import Heading from "@/components/content/Heading";
import Link from "@/components/content/Link";
import { formatDateTime } from "@/utils/datetime";

type Video = {
  videoId: string;
  title: string;
  published: Date;
  link?: string;
  vodId?: string;
};

type YouTubeRowProps = {
  videos: Video[];
};

const YouTubeRow: FC<YouTubeRowProps> = ({ videos }) => {
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
          <div className="flex w-full flex-row justify-around">
            {videos.map((video) => (
              <div
                key={video.videoId}
                className="mx-4 flex flex-col items-center"
              >
                <Trigger
                  videoId={video.videoId}
                  caption={`${video.title}: ${formatDateTime(video.published, {
                    style: "long",
                  })}`}
                  triggerId={video.videoId}
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
                    <Link href={`#${video.videoId}`} custom>
                      {formatDateTime(video.published, { style: "long" })}
                    </Link>
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

const YouTubeCarousel: FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/feeds/youtube");
        const data: Video[] = await response.json();
        data.forEach((video) => (video.published = new Date(video.published)));
        setVideos(data);
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      }
    };
    fetchVideos();
  }, []);

  return <YouTubeRow videos={videos} />;
};

export default YouTubeCarousel;
