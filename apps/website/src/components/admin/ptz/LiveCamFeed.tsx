import { WebRTCPlayer } from "@eyevinn/webrtc-player";
import { useMemo } from "react";

interface LiveCamFeedProps {
  url: string;
}

const LiveCamFeed = ({ url }: LiveCamFeedProps) => {
  const videoRefCallback = useMemo(() => {
    return (video: HTMLVideoElement) => {
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
    };
  }, [url]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
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
