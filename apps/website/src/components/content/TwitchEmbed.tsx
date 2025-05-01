import Script from "next/script";
import { useCallback, useId, useState } from "react";

type TwitchEmbedId =
  | { channel: string }
  | { video: string; collection?: string }
  | { collection: string };

type TwitchEmbedOptions = TwitchEmbedId & {
  height?: number | string;
  width?: number | string;
  parent?: string[];
  autoplay?: boolean;
  muted?: boolean;
  time?: string;
};

type TwitchEmbedProps = TwitchEmbedOptions & {
  className?: string;
};

export function TwitchEmbed({
  height = "100%",
  width = "100%",
  parent = [],
  autoplay = true,
  muted = false,
  time = "00h00m00s",
  className,
  ...ids
}: TwitchEmbedProps) {
  const channel = "channel" in ids ? ids.channel : undefined;
  const video = "video" in ids ? ids.video : undefined;
  const collection = "collection" in ids ? ids.collection : undefined;

  const embedId = "twitch-embed-" + useId();
  const [isLoaded, setIsLoaded] = useState(window.Twitch?.Embed !== undefined);

  const embedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // If we have no node, don't do anything
      if (!node) return;

      // If the Twitch embed script hasn't loaded yet, don't do anything
      if (!isLoaded) return;

      // Inject the embed into the DOM
      node.innerHTML = "";
      new window.Twitch.Embed(node.id, {
        channel,
        video,
        collection,
        height,
        width,
        parent,
        autoplay,
        muted,
        time,
      });
    },
    [
      isLoaded,
      channel,
      video,
      collection,
      height,
      width,
      parent,
      autoplay,
      muted,
      time,
    ],
  );

  return (
    <>
      <div className={className} id={embedId} ref={embedRef}></div>
      <Script
        src="https://embed.twitch.tv/embed/v1.js"
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
}
