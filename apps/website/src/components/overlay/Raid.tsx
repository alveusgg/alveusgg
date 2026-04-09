import { StreamEmbed } from "@/components/content/Stream";

const Raid = ({
  onEnded,
  className,
}: {
  onEnded?: () => void;
  className?: string;
}) => {
  return (
    <div className={className}>
      <StreamEmbed
        className="rounded-none"
        src={{ id: "a56f69df4c7206e4d0e9c5375dc56015", cu: "agf91muwks8sd9ee" }}
        autoplay
        threshold={0}
        onEnded={onEnded}
      />
    </div>
  );
};

export default Raid;
