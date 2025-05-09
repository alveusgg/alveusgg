import type { ChatMessage } from "@twurple/chat";
import Image from "next/image";
import {
  type CSSProperties,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";

import { type AmbassadorImage } from "@alveusgg/data/build/ambassadors/images";

import { classes, objToCss } from "@/utils/classes";

import useChat from "@/hooks/chat";

import IconCheckFancy from "@/icons/IconCheckFancy";

export interface Check {
  name: string;
  description?: string;
  icon: AmbassadorImage;
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
        "flex items-center gap-2 drop-shadow-md origin-center",
        className,
      )}
      style={style}
    >
      <div className="size-20 relative">
        <Image
          src={check.icon.src}
          alt={check.icon.alt}
          className={classes(
            "rounded-full border-4 size-full object-cover",
            check.status
              ? "border-green-400 saturate-50 brightness-50"
              : "border-white",
          )}
          style={{ objectPosition: check.icon.position }}
        />

        {check.status && (
          <IconCheckFancy className="absolute top-1/2 left-1/2 -translate-1/2 size-18 text-green-400 saturate-250" />
        )}
      </div>
      <span className="w-3 h-1.5 bg-white rounded-xs" />
      <div className="flex flex-col">
        <span className="text-5xl font-bold text-white">{check.name}</span>
        {check.description && (
          <span className="text-sm text-white opacity-75 font-mono">
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
  checks: Record<string, Check>;
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
          "flex flex-col justify-center items-start gap-4",
          className,
        )}
      >
        {Object.entries(checks).map(([key, check], idx) => (
          <Check
            key={key}
            check={check}
            className={`checks-${id}-item`}
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

export const useChatChecks = (
  channels: string[],
  checks: Record<string, Omit<Check, "status" | "description">>,
  users?: string[],
) => {
  const usersCleaned = useMemo(
    () => users?.map((user) => user.toLowerCase().trim()) ?? [],
    [users],
  );

  const [checksWithStatus, setChecksWithStatus] = useState<
    Record<string, Check>
  >(
    Object.fromEntries(
      Object.entries(checks).map(([key, check]) => {
        return [
          key,
          {
            ...check,
            status: false,
            description: `!check ${key}`,
          },
        ] as const;
      }),
    ),
  );

  const setStatus = useCallback((keys: string[], mode: "toggle" | "reset") => {
    if (keys.length === 0) return;

    setChecksWithStatus((prev) => {
      const newChecks = { ...prev };

      keys.forEach((key) => {
        if (!newChecks[key]) return;

        newChecks[key] = {
          ...newChecks[key],
          status: mode === "toggle" ? !newChecks[key].status : false,
        };
      });

      return newChecks;
    });
  }, []);

  useChat(
    channels,
    useCallback(
      (message: ChatMessage) => {
        const { text, userInfo } = message;
        const [command, ...keys] = text.split(" ");

        if (command !== "!check") return;
        if (
          !userInfo.isMod &&
          !userInfo.isBroadcaster &&
          !usersCleaned.includes(userInfo.userName.toLowerCase().trim())
        )
          return;

        if (keys[0] === "reset") {
          setStatus(Object.keys(checks), "reset");
          return;
        }

        setStatus(keys, "toggle");
      },
      [setStatus, checks, usersCleaned],
    ),
  );

  return checksWithStatus;
};
