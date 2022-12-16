import Script from "next/script";
import { useEffect, useId, useState } from "react";

export const TwitchEmbed: React.FC = () => {
  const id = useId();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    console.log("embed effect", { scriptLoaded });

    if (!scriptLoaded) {
      return;
    }

    // https://dev.twitch.tv/docs/embed/everything
    const embed = new Twitch.Embed(`twitch-embed-${id}`, {
      width: "100%",
      height: "100%",
      channel: "alveussanctuary",
      // collection: { video: "124085610", collection: "GMEgKwTQpRQwyA" },
      // video: "", time: "0h0m0s",
      layout: "video", // "video-with-chat"|"channel"
      allowfullscreen: true,
      autoplay: true,
      muted: false,
    });
    embed.addEventListener(Twitch.Embed.VIDEO_PLAY, function () {
      const player = embed.getPlayer();
      console.log("The video is playing", player);
    });
    embed.addEventListener(Twitch.Embed.VIDEO_READY, function () {
      const player = embed.getPlayer();
      console.log("The video is ready", player);
    });
  }, [id, scriptLoaded]);

  return (
    <div className="flex">
      <div
        className="h-[calc(100vh-100px)] flex-grow"
        id={`twitch-embed-${id}`}
      ></div>
      <div className="min-w-[300px]">
        <iframe
          src="https://www.twitch.tv/embed/alveussanctuary/chat&parent=alveus.gg&parent=www.alveus.gg"
          height="100%"
          width="100%"
          title="Chat"
          allow=""
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
        ></iframe>
      </div>
      <Script
        src="https://embed.twitch.tv/embed/v1.js"
        strategy="lazyOnload"
        onLoad={() => {
          setScriptLoaded(true);
        }}
      />
    </div>
  );
};
