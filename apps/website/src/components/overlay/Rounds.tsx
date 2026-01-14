import type { ChatMessage } from "@twurple/chat";
import { DateTime } from "luxon";
import Image, { type StaticImageData } from "next/image";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import { isActiveAmbassadorKey } from "@alveusgg/data/build/ambassadors/filters";
import { getAmbassadorImages } from "@alveusgg/data/build/ambassadors/images";

import { classes, objToCss } from "@/utils/classes";
import {
  typeSafeObjectEntries,
  typeSafeObjectFromEntries,
} from "@/utils/helpers";
import { DATETIME_ALVEUS_ZONE } from "@/utils/timezone";
import { type RouterOutputs, trpc } from "@/utils/trpc";

import useChat from "@/hooks/chat";

import Video from "@/components/content/Video";

import IconCheckFancy from "@/icons/IconCheckFancy";

import roundsDayBackground from "@/assets/stream/rounds-day.webm";
import roundsNightBackground from "@/assets/stream/rounds-night.webm";

type DatabaseCheck = RouterOutputs["stream"]["getRoundsChecks"][number];

interface Check {
  name: string;
  description?: string;
  icon: { src: string | StaticImageData; position?: string };
  status: boolean;
}

const isNotNull = <T,>(value: T | null): value is T => value !== null;

const transformChecks = (
  checks: DatabaseCheck[],
  statuses: Record<string, boolean>,
): Check[] =>
  checks
    .map((check) => {
      let icon: Check["icon"];
      if (check.ambassador) {
        if (!isActiveAmbassadorKey(check.ambassador)) return null;
        icon = getAmbassadorImages(check.ambassador)[0];
      } else {
        if (!check.fileStorageObjectUrl) return null;
        icon = { src: check.fileStorageObjectUrl.toString() };
      }

      return {
        name: check.name,
        description: `!check ${check.command}`,
        icon,
        status: statuses[check.command] ?? false,
      };
    })
    .filter(isNotNull);

const useChecks = (channels: string[], users?: string[]) => {
  const checks = trpc.stream.getRoundsChecks.useQuery(undefined, {
    refetchInterval: 15_000,
  });

  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setStatuses((prev) =>
      typeSafeObjectFromEntries(
        (checks.data ?? []).map(({ command }) => [
          command,
          prev[command] ?? false,
        ]),
      ),
    );
  }, [checks.data]);

  useChat(
    channels,
    useCallback(
      (message: ChatMessage) => {
        const { text, userInfo } = message;
        const [command, ...keys] = text.toLowerCase().split(" ");

        // Mods (or trusted users) can run the command to toggle checks
        if (
          userInfo.isMod ||
          userInfo.isBroadcaster ||
          users?.includes(userInfo.userName.toLowerCase().trim())
        ) {
          if (command === "!check") {
            setStatuses((prev) =>
              typeSafeObjectFromEntries(
                typeSafeObjectEntries(prev).map(([key, value]) => {
                  if (keys[0] === "reset") return [key, false];
                  return [key, keys.includes(key) ? !value : value];
                }),
              ),
            );
            return;
          }
        }
      },
      [users],
    ),
  );

  return useMemo(
    () => transformChecks(checks.data ?? [], statuses),
    [checks.data, statuses],
  );
};

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
          width={80}
          height={80}
          alt=""
          className={classes(
            "size-full rounded-full border-4 bg-alveus-green object-cover",
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

const Rounds = ({
  channels,
  users,
  timing = {
    duration: 750,
    delay: { item: -600, before: 1000, after: 9000 },
  },
  scale = { from: 1, to: 1.15 },
}: {
  channels: string[];
  users?: string[];
  timing?: {
    duration: number;
    delay: { item: number; before: number; after: number };
  };
  scale?: { from: number; to: number };
}) => {
  // Determine which background animation to use based on time of day
  const [night, setNight] = useState(false);
  useEffect(() => {
    const update = () => {
      const now = DateTime.now().setZone(DATETIME_ALVEUS_ZONE);
      setNight(now.hour < 6 || now.hour >= 18);
    };

    update();
    const interval = setInterval(update, 15_000);
    return () => clearInterval(interval);
  }, []);
  const background = night ? roundsNightBackground : roundsDayBackground;

  // Get the checks with chat command controls
  const checks = useChecks(channels, users);

  // Define the animation keyframes
  const id = useId().replace(/:/g, "");
  const animation = useMemo<{
    duration: { total: number; item: number };
    keyframes: string;
  }>(() => {
    const itemDuration = timing.duration + timing.delay.item;
    const totalDuration =
      itemDuration * checks.length + timing.delay.before + timing.delay.after;

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
  }, [timing, checks.length, scale]);

  return (
    <>
      <Video
        sources={background.sources}
        poster={background.poster}
        className="absolute inset-0 h-full w-full object-cover object-top-left"
        width={1920}
        height={1080}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
      />

      <div className="absolute inset-y-0 left-0 flex h-full origin-center animate-wiggle-slow flex-col items-start justify-center px-16">
        <style
          dangerouslySetInnerHTML={{
            __html: [
              `@keyframes checks-${id}-item { ${animation.keyframes} }`,
              `.checks-${id}-item { animation: ${animation.duration.total}ms checks-${id}-item infinite; will-change: scale; }`,
              `@media (prefers-reduced-motion) { .checks-${id}-item { animation: none !important; } }`,
            ].join("\n"),
          }}
        />
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

export default Rounds;
