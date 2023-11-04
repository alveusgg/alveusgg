import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";

import Consent from "@/components/Consent";

export function TwitchEmbed({ channel }: { channel: string }) {
  const embedId = "twitch-embed-" + useId();

  const [isLoaded, setIsLoaded] = useState(window.Twitch?.Embed !== undefined);
  const embedRef = useRef(null);

  useEffect(() => {
    if (!isLoaded && !embedRef.current) return;

    embedRef.current = new window.Twitch.Embed(embedId, {
      width: 854,
      height: 480,
      channel: channel,
      // Only needed if this page is going to be embedded on other websites
      parent: [],
    });
  }, [channel, embedId, isLoaded]);

  return (
    <>
      <Consent
        item={`embed ${channel}`}
        consent="twitch"
        className="alveus-twitch-embed rounded-2xl bg-alveus-green text-alveus-tan"
      >
        <div className="contents" id={embedId}></div>
        <Script
          src="https://embed.twitch.tv/embed/v1.js"
          onLoad={() => {
            setIsLoaded(true);
          }}
        />
      </Consent>
    </>
  );
}
