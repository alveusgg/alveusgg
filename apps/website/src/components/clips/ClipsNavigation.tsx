import Button from "@/components/content/Button";
import useIsActivePath from "@/hooks/active";

export default function ClipsNavigation() {
  return (
    <div className="flex flex-wrap gap-2 whitespace-nowrap text-center lg:flex-col">
      <Button href="/clips" dark filled={useIsActivePath("/clips", true)}>
        All Clips
      </Button>
      <Button
        href="/clips/submit-clip"
        dark
        filled={useIsActivePath("/clips/submit-clip")}
      >
        Submit Clip
      </Button>
    </div>
  );
}
