import {
  Stream as CloudflareStream,
  type StreamPlayerApi,
} from "@cloudflare/stream-react";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { env } from "@/env";

import { classes } from "@/utils/classes";
import { createImageUrl } from "@/utils/image";

type StreamProps = {
  src: {
    id: string;
    cu: string;
  };
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  title?: string;
  poster?: StaticImageData;
  threshold?: number;
};

const Stream = ({
  src,
  autoplay = false,
  loop = false,
  muted = false,
  controls = false,
  className,
  title,
  poster,
  threshold = 0.1,
}: StreamProps) => {
  const streamRef = useRef<StreamPlayerApi>(undefined);
  const [playing, setPlaying] = useState(autoplay);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);

  const ref = useCallback(
    (node: HTMLDivElement) => {
      if (!node) return;
      if (!threshold) {
        // If no threshold is provided, we assume the element is always visible
        setVisible(true);
        setSeen(true);
        return;
      }

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisible(entry.isIntersecting);
            if (entry.isIntersecting) setSeen(true);
          });
        },
        { threshold },
      );
      obs.observe(node);

      return () => {
        obs.disconnect();
      };
    },
    [threshold],
  );

  const playPause = useCallback(() => {
    if (!streamRef.current) return;

    if (visible) {
      if (playing) {
        streamRef.current.play();
      }
    } else {
      streamRef.current.pause();
    }
  }, [visible, playing]);

  // streamRef isn't immediately available, so we loop until it is
  useEffect(() => {
    const interval = setInterval(() => {
      if (streamRef.current) {
        clearInterval(interval);
        playPause();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [playPause]);

  const computedPoster = useMemo(
    () =>
      poster &&
      env.NEXT_PUBLIC_BASE_URL +
        createImageUrl({ src: poster.src, width: 1200 }),
    [poster],
  );

  return (
    <div className={classes("relative", className)} ref={ref}>
      {poster && (
        <Image
          src={poster}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          width={1200}
        />
      )}
      {seen && (
        <CloudflareStream
          src={src.id}
          customerCode={src.cu}
          loop={loop}
          muted={muted}
          controls={controls}
          title={title}
          poster={computedPoster}
          width="100%"
          height="100%"
          letterboxColor="transparent"
          streamRef={streamRef}
          onPlay={() => visible && controls && setPlaying(true)}
          onPause={() => visible && controls && setPlaying(false)}
        />
      )}
    </div>
  );
};

export default Stream;
