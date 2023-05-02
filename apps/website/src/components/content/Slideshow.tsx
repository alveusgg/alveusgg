import type { ImageProps } from "next/image";
import Image from "next/image";
import React, { type CSSProperties, useId, useMemo } from "react";
import { camelToKebab } from "../../utils/string-case";

type SlideshowProps = {
  images: {
    src: ImageProps["src"];
    alt: string;
  }[];
  timing?: {
    fade: number;
    delay: number;
  };
  scale?: {
    from: number;
    to: number;
  };
};

const objToCss = (obj: Record<string, CSSProperties> | CSSProperties): string =>
  Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === "object") return `${key} { ${objToCss(value)} }`;
      return `${camelToKebab(key)}: ${value};`;
    })
    .join(" ");

const Slideshow: React.FC<SlideshowProps> = ({
  images,
  timing = { fade: 500, delay: 5000 },
  scale = { from: 1.1, to: 1.2 },
}) => {
  // Define the animation keyframes
  const id = useId().replace(/:/g, "");
  const animation = useMemo<{
    duration: { total: number; offset: number };
    keyframes: { container: string; image: string };
  }>(() => {
    // A single image's duration is the fade in + fade out + delay
    const duration = timing.fade * 2 + timing.delay;
    // But the offset between each is just fade in + delay, no fade out as they overlap
    const offsetDuration = timing.fade + timing.delay;
    const totalDuration = offsetDuration * images.length;

    return {
      duration: {
        total: totalDuration,
        offset: offsetDuration,
      },
      keyframes: {
        container: objToCss({
          // The image needs to be visible as the previous one fades out
          "0%": {
            opacity: 1,
            zIndex: 0,
          },
          // We need to stay behind the previous image until it's fully faded out
          [`${(timing.fade / totalDuration) * 100}%`]: {
            opacity: 1,
            zIndex: 0,
          },
          // Start fading out once we've had our time in the spotlight
          [`${(offsetDuration / totalDuration) * 100}%`]: {
            opacity: 1,
            zIndex: 1,
          },
          // We're faded out, wait for the rest of the images to do their thing
          [`${(duration / totalDuration) * 100}%`]: {
            opacity: 0,
            zIndex: 1,
          },
          "100%": {
            opacity: 0,
            zIndex: 1,
          },
        }),
        image: objToCss({
          // Start zooming as soon as the previous image starts to fade out
          "0%": {
            transform: `scale(${scale.from})`,
          },
          // Keep zooming in until we're fully faded out, then wait for everyone else
          [`${(duration / totalDuration) * 100}%`]: {
            transform: `scale(${scale.to})`,
          },
          "100%": {
            transform: `scale(${scale.to})`,
          },
        }),
      },
    };
  }, [timing, images.length, scale]);

  return (
    <div className="relative z-0 h-full w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: [
            `@keyframes slideshow-${id}-container { ${animation.keyframes.container} }`,
            `@keyframes slideshow-${id}-image { ${animation.keyframes.image} }`,
            `.slideshow-${id}-container { animation: ${animation.duration.total}ms slideshow-${id}-container infinite; will-change: opacity, z-index; }`,
            `.slideshow-${id}-container img { animation: ${animation.duration.total}ms slideshow-${id}-image infinite; transform: scale(${scale.from}); will-change: transform; }`,
            `@media (prefers-reduced-motion) { .slideshow-${id}-container img { animation: none !important; } }`,
          ].join("\n"),
        }}
      />
      {images.map(({ src, alt }, idx) => (
        <div
          className={`absolute inset-0 z-0 overflow-clip opacity-0 slideshow-${id}-container`}
          key={
            typeof src === "string"
              ? src
              : "default" in src
              ? src.default.src
              : src.src
          }
          style={{
            animationDelay: `${idx * animation.duration.offset}ms`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            sizes="100vw"
            quality={100}
            priority={idx === 0}
            placeholder="blur"
            className="h-full w-full object-cover"
            style={{
              animationDelay: `${idx * animation.duration.offset}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Slideshow;
