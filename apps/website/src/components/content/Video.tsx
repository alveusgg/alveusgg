import React, { useCallback, useState } from "react";

type VideoProps = {
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  className?: string;
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
  poster,
  sources,
  threshold = 0.1,
}) => {
  const [seen, setSeen] = useState(false);
  const ref = useCallback(
    (node: HTMLVideoElement) => {
      if (!node || seen) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            setSeen(true);
            observer.disconnect();
          });
        },
        { threshold }
      );
      observer.observe(node);
    },
    [seen, threshold]
  );

  return (
    <video
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      className={className}
      poster={poster}
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
