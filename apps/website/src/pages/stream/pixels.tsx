import { type NextPage } from "next";
import { useCallback, useState } from "react";

import useLocaleString from "@/hooks/locale";
import type { Pixel, StoredPixel } from "@/hooks/pixels";

import Pixels from "@/components/institute/Pixels";

const PixelsPage: NextPage = () => {
  const [total, setTotal] = useState(0);
  const [unlocked, setUnlocked] = useState(0);

  const onChange = useCallback(
    (_newPixels: Pixel[], allPixels: StoredPixel[]) => {
      setTotal(allPixels.length);
      setUnlocked(allPixels.filter((p) => p !== null).length);
    },
    [],
  );

  const unlockedLocale = useLocaleString(unlocked);
  const totalLocale = useLocaleString(total);

  return (
    <div className="grid h-screen w-full grid-cols-3 grid-rows-3">
      <div className="col-span-2 col-start-2 row-span-1 row-start-3 flex flex-col justify-end">
        <div className="mx-1 mb-1 flex shrink-0 flex-row items-center justify-between">
          <p className="ml-auto font-bold text-white tabular-nums text-stroke">
            <span className="opacity-10 select-none">
              {totalLocale
                .slice(0, totalLocale.length - unlockedLocale.length)
                .replace(/\d/g, "0")}
            </span>
            {unlockedLocale} / {totalLocale} pixels unlocked
          </p>
        </div>

        <Pixels
          onChange={onChange}
          className="min-h-0 shrink"
          canvasClassName="ml-auto rounded-tl ring-4 ring-alveus-green"
        />
      </div>
    </div>
  );
};

export default PixelsPage;
