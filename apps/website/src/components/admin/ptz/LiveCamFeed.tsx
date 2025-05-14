import { WebRTCPlayer } from "@eyevinn/webrtc-player";

interface LiveCamFeedProps {
  url: string;
}

const LiveCamFeed = ({ url }: LiveCamFeedProps) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black">
      <video
        className="aspect-video max-h-full max-w-full"
        ref={(video) => {
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
        }}
        autoPlay
        muted
      />
    </div>
  );
};

export default LiveCamFeed;
