import type { ImageProps } from "next/image"
import Image from "next/image"
import { type CSSProperties, useId, useMemo } from "react"

type SlideshowProps = {
  images: {
    src: ImageProps["src"],
    alt: string,
  }[],
  timing?: {
    fade: number,
    delay: number,
  },
  scale?: {
    from: number,
    to: number,
  },
};


const Slideshow: React.FC<SlideshowProps> = ({ images, timing = { fade: 500, delay: 5000 }, scale = { from: 1.1, to: 1.2 } }) => {
  // Define the animation keyframes
  const id = useId().replace(/:/g, "");
  const animation = useMemo<{
    duration: { total: number, offset: number },
    keyframes: { container: Record<string, CSSProperties>, image: Record<string, CSSProperties> },
  }>(() => {
    // A single image's duration is the fade in + fade out + delay
    const duration = (timing.fade * 2) + timing.delay;
    // But the offset between each is just fade in + delay, no fade out as they overlap
    const offsetDuration = timing.fade + timing.delay;
    const totalDuration = offsetDuration * images.length;

    return {
      duration: {
        total: totalDuration,
        offset: offsetDuration,
      },
      keyframes: {
        container: {
          // The image needs to be visible as the previous one fades out
          "0%": { opacity: 1, zIndex: 0 },
          // We need to stay behind the previous image until it's fully faded out
          [`${(timing.fade / totalDuration) * 100}%`]: { opacity: 1, zIndex: 0 },
          // Start fading out once we've had our time in the spotlight
          [`${(offsetDuration / totalDuration) * 100}%`]: { opacity: 1, zIndex: 1 },
          // We're faded out, wait for the rest of the images to do their thing
          [`${(duration / totalDuration) * 100}%`]: { opacity: 0, zIndex: 1 },
          "100%": { opacity: 0, zIndex: 1 },
        },
        image: {
          // Start zooming as soon as the previous image starts to fade out
          "0%": { transform: `scale(${scale.from})` },
          // Keep zooming in until we're fully faded out, then wait for everyone else
          [`${(duration / totalDuration) * 100}%`]: { transform: `scale(${scale.to})` },
          "100%": { transform: `scale(${scale.to})` },
        },
      },
    };
  }, [ timing, images.length, scale ]);

  // Get a string of the keyframes
  const objToCss = (obj: (Record<string, CSSProperties> | CSSProperties)): string =>
    Object.entries(obj).map(([ key, value ]) => {
      if (typeof value === "object") return `${key} { ${objToCss(value)} }`;
      return `${key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}: ${value};`;
    }).join(" ");
  const keyframes = `
  @keyframes slideshow-${id}-container { ${objToCss(animation.keyframes.container)} }
  @keyframes slideshow-${id}-image { ${objToCss(animation.keyframes.image)} }`;

  return (
    <div className="relative h-full w-full z-0">
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      {images.map(({ src, alt }, idx) => (
        <div
          className="absolute inset-0 overflow-clip opacity-0 z-0"
          key={typeof src === "string" ? src : ("default" in src ? src.default.src : src.src)}
          style={{
            animation: `${animation.duration.total}ms slideshow-${id}-container infinite`,
            animationDelay: `${idx * animation.duration.offset}ms`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            style={{
              animation: `${animation.duration.total}ms slideshow-${id}-image infinite`,
              animationDelay: `${idx * animation.duration.offset}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Slideshow;
