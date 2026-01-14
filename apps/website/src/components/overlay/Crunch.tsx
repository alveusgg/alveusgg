import crunch from "@/assets/stream/crunch.webm";

import Video from "../content/Video";

const Crunch = ({
  onEnded,
  className,
}: {
  onEnded?: () => void;
  className?: string;
}) => {
  return (
    <div className={className}>
      <Video
        sources={crunch.sources}
        poster={crunch.poster}
        className="h-full w-full object-contain"
        width={1920}
        height={1080}
        autoPlay
        playsInline
        disablePictureInPicture
        onEnded={onEnded}
      />
    </div>
  );
};

export default Crunch;
