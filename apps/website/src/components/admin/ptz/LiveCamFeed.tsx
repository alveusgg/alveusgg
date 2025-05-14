import { WebRTCPlayer } from "@eyevinn/webrtc-player";
import { useCallback } from "react";

interface LiveCamFeedProps {
  url: string;
}

const LiveCamFeed = ({ url }: LiveCamFeedProps) => {
  const videoRefCallback = useCallback(
    (video: HTMLVideoElement) => {
      if (!video) return;
      const player = new WebRTCPlayer({
        type: "whep",
        video: video,
      });

      player
        .load(new URL(url))
        .then(() => console.log(`[LOLA] Loaded`))
        .catch((error) => console.error(`[LOLA] Error`, error));

      return () => {
        player.destroy();
      };
    },
    [url],
  );

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <video
        className="aspect-video max-h-full max-w-full"
        ref={videoRefCallback}
        autoPlay
        muted
      />
    </div>
  );
};

export default LiveCamFeed;
