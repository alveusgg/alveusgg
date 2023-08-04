import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

export const TwitchEmbed: React.FC = () => {
  const id = useId();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const statusRef = useRef<null | "active">(null);

  useEffect(() => {
    if (!("Twitch" in window) || statusRef.current === "active") {
      return;
    }

    statusRef.current = "active";

    // https://dev.twitch.tv/docs/embed/everything
    const embed = new window.Twitch.Embed(`twitch-embed-${id}`, {
      width: "100%",
      height: "100%",
      channel: "alveussanctuary",
      // collection: { video: "124085610", collection: "GMEgKwTQpRQwyA" },
      // video: "", time: "0h0m0s",
      layout: "video-with-chat", // "video-with-chat"|"channel"
      allowfullscreen: true,
      autoplay: true,
      muted: false,
    });
    embed.addEventListener(window.Twitch.Embed.VIDEO_PLAY, function () {
      const player = embed.getPlayer();
      console.log("The video is playing", player);
    });
    embed.addEventListener(window.Twitch.Embed.VIDEO_READY, function () {
      const player = embed.getPlayer();
      console.log("The video is ready", player);
    });
  }, [id, scriptLoaded]);

  return (
    <div className="relative flex h-[calc(100vh-100px)] bg-black twitchSideBySide:h-auto twitchSideBySide:max-h-[80vh] twitchSideBySide:min-h-[500px] twitchSideBySide:flex-1">
      <div className="w-[calc(100%-340px)]">
        <div className="user-select-none pointer-events-none relative z-20 h-full twitchSideBySide:pt-[56.25%]"></div>
      </div>
      <div className="absolute inset-0" id={`twitch-embed-${id}`}></div>
      {/*
      <div className="min-w-[300px]">
        <iframe
          src="https://www.twitch.tv/embed/alveussanctuary/chat?parent=www.alveus.gg&parent=localhost"
          height="100%"
          width="100%"
          title="Chat"
          allow=""
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
        ></iframe>
      </div>
      */}
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
