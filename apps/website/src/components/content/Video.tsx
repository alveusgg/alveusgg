import React, { useCallback, useRef, useState } from "react";

import { createImageUrl } from "@/utils/image";

type VideoProps = {
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  className?: string;
  title?: string;
  poster?: string;
  sources: {
    src: string;
    type: string;
  }[];
  threshold?: number;
};

const Video: React.FC<VideoProps> = ({
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = false,
  className = "",
  title,
  poster,
  sources,
  threshold = 0.1,
}) => {
  const [seen, setSeen] = useState(false);
  const observer = useRef<IntersectionObserver>();
  const ref = useCallback(
    (node: HTMLVideoElement) => {
      if (!node) {
        if (observer.current) {
          observer.current.disconnect();
          observer.current = undefined;
        }
        return;
      }

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!seen) setSeen(true);
              (entry.target as HTMLVideoElement).play();
              return;
            }

            (entry.target as HTMLVideoElement).pause();
          });
        },
        { threshold },
      );
      obs.observe(node);
      observer.current = obs;
    },
    [seen, threshold],
  );

  const computedPoster = poster && createImageUrl({ src: poster, width: 512 });

  return (
    <video
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      className={className}
      title={title}
      poster={computedPoster}
      ref={ref}
    >
      {seen &&
        sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
    </video>
  );
};

export default Video;
