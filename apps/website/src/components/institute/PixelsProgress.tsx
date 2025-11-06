import { PIXEL_TOTAL } from "@/data/murals";

import { classes } from "@/utils/classes";

import { usePixels } from "@/hooks/pixels";

import Progress from "../content/Progress";

const PixelsProgress = ({ className }: { className?: string }) => {
  const pixels = usePixels();
  const unlocked = pixels?.length ?? 0;
  const total = PIXEL_TOTAL;

  return (
    <Progress
      progress={total === 0 ? 0 : (unlocked / total) * 100}
      className={classes("ring-4 ring-alveus-green", className)}
    />
  );
};

export default PixelsProgress;
