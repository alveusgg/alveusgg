import { DateTime } from "luxon";
import { type NextPage } from "next";
import Image from "next/image";
import { type CSSProperties, useEffect, useId, useState } from "react";

import {
  type AmbassadorImage,
  getAmbassadorImages,
} from "@alveusgg/data/build/ambassadors/images";

import { classes, objToCss } from "@/utils/classes";
import { DATETIME_ALVEUS_ZONE } from "@/utils/datetime";

import Video from "@/components/content/Video";

import roundsDayBackground from "@/assets/rounds/day.webm";
import roundsNightBackground from "@/assets/rounds/night.webm";

interface Check {
  name: string;
  icon: AmbassadorImage;
}

const checks: Record<string, Check> = {
  foxes: {
    name: "Foxes",
    icon: getAmbassadorImages("reed")[0],
  },
  wolfdogs: {
    name: "Wolfdogs",
    icon: getAmbassadorImages("awa")[0],
  },
  pushpop: {
    name: "Push Pop",
    icon: getAmbassadorImages("pushPop")[0],
  },
  crows: {
    name: "Crows",
    icon: getAmbassadorImages("abbott")[0],
  },
  marmosets: {
    name: "Marmosets",
    icon: getAmbassadorImages("appa")[0],
  },
  critters: {
    name: "Insects/Reptiles",
    icon: getAmbassadorImages("barbaraBakedBean")[0],
  },
  winnie: {
    name: "Winnie",
    icon: getAmbassadorImages("winnieTheMoo")[0],
  },
  stompy: {
    name: "Stompy",
    icon: getAmbassadorImages("stompy")[0],
  },
  donkeys: {
    name: "Donkeys",
    icon: getAmbassadorImages("jalapeno")[0],
  },
  parrots: {
    name: "Parrots",
    icon: getAmbassadorImages("siren")[0],
  },
  chickens: {
    name: "Chickens",
    icon: getAmbassadorImages("oliver")[0],
  },
};

const Check = ({
  check,
  className,
  style,
}: {
  check: Check;
  className?: string;
  style?: CSSProperties;
}) => {
  return (
    <div
      className={classes(
        "flex items-center gap-2 drop-shadow-md origin-center",
        className,
      )}
      style={style}
    >
      <Image
        src={check.icon.src}
        alt={check.icon.alt}
        className="rounded-full border-4 border-white size-20 object-cover"
        style={{ objectPosition: check.icon.position }}
      />
      <span className="w-3 h-1.5 bg-white rounded-xs" />
      <span className="text-5xl font-bold text-white">{check.name}</span>
    </div>
  );
};

const timing = {
  duration: 750,
  delay: { item: -600, before: 1000, after: 9000 },
};
const scale = { from: 1, to: 1.15 };

const itemDuration = timing.duration + timing.delay.item;
const totalDuration =
  itemDuration * Object.keys(checks).length +
  timing.delay.before +
  timing.delay.after;

const keyframes = objToCss({
  "0%": {
    scale: scale.from,
  },
  [`${(timing.delay.before / totalDuration) * 100}%`]: {
    scale: scale.from,
  },
  [`${((timing.delay.before + timing.duration / 2) / totalDuration) * 100}%`]: {
    scale: scale.to,
  },
  [`${((timing.delay.before + timing.duration) / totalDuration) * 100}%`]: {
    scale: scale.from,
  },
  "100%": {
    scale: scale.from,
  },
});

const RoundsPage: NextPage = () => {
  const id = useId();

  const [night, setNight] = useState(false);
  useEffect(() => {
    const update = () => {
      const now = DateTime.now().setZone(DATETIME_ALVEUS_ZONE);
      setNight(now.hour < 6 || now.hour >= 18);
    };

    update();
    const interval = setInterval(update, 15_000);
    return () => clearInterval(interval);
  });

  const background = night ? roundsNightBackground : roundsDayBackground;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: [
            `@keyframes rounds-${id}-item { ${keyframes} }`,
            `.rounds-${id}-item { animation: ${totalDuration}ms rounds-${id}-item infinite; will-change: scale; }`,
            `@media (prefers-reduced-motion) { .rounds-${id}-item { animation: none !important; } }`,
          ].join("\n"),
        }}
      />
      <div className="h-screen w-full">
        <Video
          sources={background.sources}
          poster={background.poster}
          className="h-full w-full object-cover absolute inset-0 object-top-left"
          width={1920}
          height={1080}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
        />

        <div className="flex flex-col h-full max-h-full overflow-hidden justify-center items-start px-16 gap-4">
          {Object.entries(checks).map(([key, check], idx) => (
            <Check
              key={key}
              check={check}
              className={`rounds-${id}-item`}
              style={{
                animationDelay: `${idx * itemDuration}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default RoundsPage;
