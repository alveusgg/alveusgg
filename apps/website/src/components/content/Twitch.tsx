import { useMemo } from "react";

import { env } from "@/env";

import { classes } from "@/utils/classes";

import usePrefersReducedMotion from "@/hooks/motion";

const getChatSrc = ({
  channel,
  parent,
}: {
  channel: string;
  parent: string;
}): string => {
  const url = new URL(
    `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat`,
  );
  url.searchParams.set("parent", parent);
  return url.toString();
};

export const TwitchChat = ({
  channel,
  className,
}: {
  channel: string;
  className?: string;
}) => {
  const src = useMemo(() => {
    const host = new URL(
      typeof window !== "undefined"
        ? window.location.href
        : env.NEXT_PUBLIC_BASE_URL,
    ).hostname;
    return getChatSrc({
      channel,
      parent: host,
    });
  }, [channel]);

  return (
    <iframe
      src={src}
      title={`twitch.tv/${channel} live chat embed`}
      referrerPolicy="no-referrer"
      sandbox="allow-same-origin allow-scripts"
      className={classes("h-full w-full", className)}
    ></iframe>
  );
};

const getSrc = ({
  channel,
  parent,
  autoplay,
  muted,
  allowfullscreen,
}: {
  channel: string;
  parent: string;
  autoplay: boolean;
  muted: boolean;
  allowfullscreen: boolean;
}): string => {
  const url = new URL("https://player.twitch.tv");
  url.searchParams.set("channel", channel);
  url.searchParams.set("parent", parent);
  url.searchParams.set("autoplay", autoplay.toString());
  url.searchParams.set("muted", muted.toString());
  url.searchParams.set("allowfullscreen", allowfullscreen.toString());
  url.searchParams.set("width", "100%");
  url.searchParams.set("height", "100%");
  return url.toString();
};

const Twitch = ({
  channel,
  autoplay,
  muted = false,
  allowfullscreen = false,
  className,
}: {
  channel: string;
  autoplay?: boolean;
  muted?: boolean;
  allowfullscreen?: boolean;
  className?: string;
}) => {
  const reducedMotion = usePrefersReducedMotion();
  const computedAutoplay = autoplay === undefined ? !reducedMotion : autoplay;

  const src = useMemo(() => {
    const host = new URL(
      typeof window !== "undefined"
        ? window.location.href
        : env.NEXT_PUBLIC_BASE_URL,
    ).hostname;
    return getSrc({
      channel,
      parent: host,
      autoplay: computedAutoplay,
      muted,
      allowfullscreen,
    });
  }, [channel, computedAutoplay, muted, allowfullscreen]);

  return (
    <iframe
      src={src}
      title={`twitch.tv/${channel} live stream embed`}
      referrerPolicy="no-referrer"
      allow="autoplay; encrypted-media"
      sandbox="allow-same-origin allow-scripts"
      className={classes("aspect-video h-auto w-full", className)}
    ></iframe>
  );
};

export default Twitch;
