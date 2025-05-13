import { WebRTCPlayer } from "@eyevinn/webrtc-player";
import { useCallback, useEffect, useState } from "react";

const getTwitchEmbed = (
  channel: string,
  parent: string,
  autoPlay = true,
): string => {
  const url = new URL("https://player.twitch.tv");
  url.searchParams.set("channel", channel);
  url.searchParams.set("parent", parent);
  url.searchParams.set("autoplay", autoPlay.toString());
  url.searchParams.set("muted", "true");
  url.searchParams.set("allowfullscreen", "false");
  url.searchParams.set("width", "100%");
  url.searchParams.set("height", "100%");
  return url.toString();
};

const LiveCamTwitch = () => {
  const [twitchEmbed, setTwitchEmbed] = useState<string | null>(null);
  useEffect(() => {
    setTwitchEmbed(getTwitchEmbed("alveussanctuary", window.location.hostname));
  }, []);

  return (
    twitchEmbed && (
      <iframe
        src={twitchEmbed}
        title="Twitch livestream"
        referrerPolicy="no-referrer"
        allow="autoplay; encrypted-media"
        sandbox="allow-same-origin allow-scripts"
        className="pointer-events-none size-full object-contain"
        tabIndex={-1}
      ></iframe>
    )
  );
};

const LiveCamFeed = ({ url }: { url?: string }) => {
  const [fallback, setFallback] = useState(false);

  const videoRefCallback = useCallback(
    (video: HTMLVideoElement) => {
      if (!video || !url) return;

      const player = new WebRTCPlayer({
        type: "whep",
        video: video,
      });

      player
        .load(new URL(url))
        .then(() => console.log(`[LOLA] Loaded`))
        .catch((error) => {
          console.error(`[LOLA] Error`, error);
          setFallback(true);
        });

      return () => {
        player.destroy();
      };
    },
    [url],
  );

  useEffect(() => {
    setFallback(!url);
  }, [url]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      {fallback ? (
        <LiveCamTwitch />
      ) : (
        <video
          className="aspect-video max-h-full max-w-full"
          ref={videoRefCallback}
          autoPlay
          muted
        />
      )}
    </div>
  );
};

export default LiveCamFeed;
