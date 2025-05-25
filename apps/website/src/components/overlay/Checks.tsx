import Image, { type StaticImageData } from "next/image";
import { type CSSProperties, useId, useMemo } from "react";

import { classes, objToCss } from "@/utils/classes";

import IconCheckFancy from "@/icons/IconCheckFancy";

export interface Check {
  name: string;
  description?: string;
  icon: { src: string | StaticImageData; position?: string };
  status: boolean;
}

const Check = ({
  check,
  className,
  style,
}: {
  key: string;
  check: Check;
  className?: string;
  style?: CSSProperties;
}) => {
  return (
    <div
      className={classes(
        "flex origin-center items-center gap-2 drop-shadow-md",
        className,
      )}
      style={style}
    >
      <div className="relative size-20">
        <Image
          src={check.icon.src}
          alt=""
          className={classes(
            "size-full rounded-full border-4 object-cover",
            check.status
              ? "border-green-400 brightness-50 saturate-50"
              : "border-white",
          )}
          style={{ objectPosition: check.icon.position }}
        />

        {check.status && (
          <IconCheckFancy className="absolute top-1/2 left-1/2 size-18 -translate-1/2 text-green-400 saturate-250" />
        )}
      </div>
      <span className="h-1.5 w-3 rounded-xs bg-white" />
      <div className="flex flex-col">
        <span className="text-5xl font-bold text-white">{check.name}</span>
        {check.description && (
          <span className="font-mono text-sm text-white opacity-75">
            {check.description}
          </span>
        )}
      </div>
    </div>
  );
};

const Checks = ({
  checks,
  timing = {
    duration: 750,
    delay: { item: -600, before: 1000, after: 9000 },
  },
  scale = { from: 1, to: 1.15 },
  className,
}: {
  checks: Check[];
  timing?: {
    duration: number;
    delay: { item: number; before: number; after: number };
  };
  scale?: { from: number; to: number };
  className?: string;
}) => {
  // Define the animation keyframes
  const id = useId().replace(/:/g, "");
  const length = Object.keys(checks).length;
  const animation = useMemo<{
    duration: { total: number; item: number };
    keyframes: string;
  }>(() => {
    const itemDuration = timing.duration + timing.delay.item;
    const totalDuration =
      itemDuration * length + timing.delay.before + timing.delay.after;

    return {
      duration: {
        item: itemDuration,
        total: totalDuration,
      },
      keyframes: objToCss({
        "0%": {
          scale: scale.from,
        },
        [`${(timing.delay.before / totalDuration) * 100}%`]: {
          scale: scale.from,
        },
        [`${((timing.delay.before + timing.duration / 2) / totalDuration) * 100}%`]:
          {
            scale: scale.to,
          },
        [`${((timing.delay.before + timing.duration) / totalDuration) * 100}%`]:
          {
            scale: scale.from,
          },
        "100%": {
          scale: scale.from,
        },
      }),
    };
  }, [timing, length, scale]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: [
            `@keyframes checks-${id}-item { ${animation.keyframes} }`,
            `.checks-${id}-item { animation: ${animation.duration.total}ms checks-${id}-item infinite; will-change: scale; }`,
            `@media (prefers-reduced-motion) { .checks-${id}-item { animation: none !important; } }`,
          ].join("\n"),
        }}
      />
      <div
        className={classes(
          "flex flex-col items-start justify-center",
          className,
        )}
      >
        {checks.map((check, idx) => (
          <Check
            key={`${check.name}-${idx}`}
            check={check}
            className={classes(`checks-${id}-item`, idx % 2 !== 0 && "ml-32")}
            style={{
              animationDelay: `${idx * animation.duration.item}ms`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default Checks;
