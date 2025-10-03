import { WebRTCPlayer } from "@eyevinn/webrtc-player";
import { useCallback, useEffect, useState } from "react";

import { trpc } from "@/utils/trpc";

const LiveCamFeed = () => {
  const feedUrl = trpc.stream.getFeedUrl.useQuery(undefined, {
    refetchInterval: 1000 * 60 * 5,
  });
  const [url, setUrl] = useState<string>();

  // Continue to use the first URL we're given until we get an error
  // We do this to avoid the player being continually reloaded,
  //  as the first URL will keep working as long as it isn't reloaded
  useEffect(() => {
    if (feedUrl.isError) {
      setUrl(undefined);
      return;
    }

    setUrl((prev) => prev ?? feedUrl.data?.url);
  }, [feedUrl.isError, feedUrl.data?.url]);

  const ref = useCallback(
    (video: HTMLVideoElement) => {
      if (!video || !url) return;

      const player = new WebRTCPlayer({
        type: "whep",
        video: video,
        timeoutThreshold: 1000,
        statsTypeFilter: "^inbound-rtp$",
      });

      player.on("stats:inbound-rtp", (report) => {
        if (report.kind === "video") {
          console.log(
            `[LOLA] Stats ${report.frameWidth}x${report.frameHeight}@${report.framesPerSecond} (${report.lastPacketReceivedTimestamp - report.timestamp}ms)`,
            report,
          );
        }
      });

      player.on("no-media", () => {
        console.log("[LOLA] Media timeout occurred");
      });
      player.on("media-recovered", () => {
        console.log("[LOLA] Media recovered");
      });

      player
        .load(new URL(url))
        .then(() => console.log("[LOLA] Loaded"))
        .catch((error) => console.error("[LOLA] Error loading", error));

      return () => {
        player
          .unload()
          .then(() => console.log("[LOLA] Unloaded"))
          .catch((error) => console.error("[LOLA] Error unloading", error))
          .finally(() => {
            player.destroy();
          });
      };
    },
    [url],
  );

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <video
        className="aspect-video max-h-full max-w-full"
        ref={ref}
        autoPlay
        muted
      />
    </div>
  );
};

export default LiveCamFeed;
