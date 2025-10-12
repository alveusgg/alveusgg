import { useCallback, useState } from "react";

import { classes } from "@/utils/classes";

import type { Pixel, StoredPixel } from "@/hooks/pixels";
import usePixels, { PIXEL_GRID_HEIGHT, PIXEL_GRID_WIDTH } from "@/hooks/pixels";

import Progress from "../content/Progress";

const PixelsProgress = ({
  onChange,
  className,
}: {
  onChange?: (newPixels: Pixel[], allPixels: StoredPixel[]) => void;
  className?: string;
}) => {
  const [unlocked, setUnlocked] = useState(0);
  const [total, setTotal] = useState(PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT);

  usePixels(
    useCallback(
      (newPixels: Pixel[], allPixels: StoredPixel[]) => {
        onChange?.(newPixels, allPixels);

        setUnlocked(allPixels.filter((p) => p !== null).length);
        setTotal(allPixels.length);
      },
      [onChange],
    ),
  );

  return (
    <Progress
      progress={total === 0 ? 0 : (unlocked / total) * 100}
      className={classes("ring-4 ring-alveus-green", className)}
    />
  );
};

export default PixelsProgress;
