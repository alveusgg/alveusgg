import { useCallback, useMemo, useRef, useState } from "react";

import { createImageUrl } from "@/utils/image";

type VideoProps = {
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  disablePictureInPicture?: boolean;
  className?: string;
  title?: string;
  poster?: string;
  width?: number;
  height?: number;
  sources: {
    src: string;
    size: number;
    type: string;
  }[];
  threshold?: number;
  onEnded?: () => void;
};

const Video = ({
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = false,
  disablePictureInPicture = false,
  className = "",
  title,
  poster,
  width,
  height,
  sources,
  threshold = 0.1,
  onEnded,
}: VideoProps) => {
  const [seen, setSeen] = useState(false);
  const observer = useRef<IntersectionObserver>(null);
  const ref = useCallback(
    (node: HTMLVideoElement) => {
      if (!node) {
        if (observer.current) {
          observer.current.disconnect();
          observer.current = null;
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

  const computedPoster = useMemo(
    () => poster && createImageUrl({ src: poster, width: 512 }),
    [poster],
  );
  const computedKey = useMemo(
    () => sources.map((source) => source.src).join(","),
    [sources],
  );

  return (
    <video
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      disablePictureInPicture={disablePictureInPicture}
      className={className}
      title={title}
      width={width}
      height={height || sources[0]?.size}
      onEnded={onEnded}
      poster={computedPoster}
      key={computedKey}
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
