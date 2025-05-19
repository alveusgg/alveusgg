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

  const [player, setPlayer] = useState<WebRTCPlayer & { loaded: boolean }>();

  useEffect(() => {
    if (!player) return;

    (async () => {
      // Always unload the player if the URL changes
      // This ensures that the underlying connection doesn't remain open
      if (player.loaded) {
        await player
          .unload()
          .then(() => {
            console.log(`[LOLA] Unloaded`);
            player.loaded = false;
          })
          .catch((error) => {
            console.error(`[LOLA] Error unloading`, error);
          });
      }

      if (!url) return;

      await player
        .load(new URL(url))
        .then(() => {
          console.log(`[LOLA] Loaded`);
          player.loaded = true;
        })
        .catch((error) => console.error(`[LOLA] Error loading`, error));
    })();
  }, [url, player]);

  const ref = useCallback((video: HTMLVideoElement) => {
    if (!video) return;
    const player = Object.assign(
      new WebRTCPlayer({
        type: "whep",
        video: video,
      }),
      { loaded: false },
    );
    setPlayer(player);

    return () => {
      setPlayer((prev) => (prev === player ? undefined : prev));
      if (player.loaded) {
        player
          .unload()
          .then(() => {
            console.log(`[LOLA] Unloaded`);
            player.destroy();
          })
          .catch((error) => {
            console.error(`[LOLA] Error unloading`, error);
          });
      }
    };
  }, []);

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
