import { useEffect, useState } from "react";

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

const Player = () => {
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

export default Player;
