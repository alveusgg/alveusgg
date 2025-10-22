import { classes } from "@/utils/classes";

import { PIXEL_TOTAL, useLivePixels } from "@/hooks/pixels";

import Progress from "../content/Progress";

const PixelsProgress = ({ className }: { className?: string }) => {
  const pixels = useLivePixels();
  const unlocked = pixels.data?.pixels.length ?? 0;
  const total = PIXEL_TOTAL;

  return (
    <Progress
      progress={total === 0 ? 0 : (unlocked / total) * 100}
      className={classes("ring-4 ring-alveus-green", className)}
    />
  );
};

export default PixelsProgress;
