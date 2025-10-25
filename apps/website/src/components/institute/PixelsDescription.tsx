import { classes } from "@/utils/classes";

import useLocaleString from "@/hooks/locale";
import { PIXEL_TOTAL, usePixels } from "@/hooks/pixels";

function PixelsDescription({ className }: { className?: string }) {
  const pixels = usePixels();
  const unlocked = pixels?.length ?? 0;
  const total = PIXEL_TOTAL;

  const unlockedLocale = useLocaleString(unlocked);
  const totalLocale = useLocaleString(total);

  return (
    <p className={classes("tabular-nums", className)}>
      <span className="opacity-10 select-none">
        {totalLocale
          .slice(0, totalLocale.length - unlockedLocale.length)
          .replace(/\d/g, "0")}
      </span>
      {unlockedLocale} / {totalLocale} pixels unlocked
    </p>
  );
}

export default PixelsDescription;
