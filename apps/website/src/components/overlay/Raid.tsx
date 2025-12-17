import { StreamEmbed } from "@/components/content/Stream";

const Raid = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <StreamEmbed
        className="rounded-none"
        src={{ id: "df45caa8c19086454f6f628640b8f648", cu: "agf91muwks8sd9ee" }}
        autoplay
        threshold={0}
      />
    </div>
  );
};

export default Raid;
