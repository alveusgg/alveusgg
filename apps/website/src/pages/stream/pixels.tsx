import { type NextPage } from "next";
import { useRouter } from "next/router";

import { classes } from "@/utils/classes";

import {
  PIXEL_GRID_HEIGHT,
  PIXEL_GRID_WIDTH,
  PixelProvider,
} from "@/hooks/pixels";

import Pixels from "@/components/institute/Pixels";
import PixelsDescription from "@/components/institute/PixelsDescription";
import PixelsProgress from "@/components/institute/PixelsProgress";

const modes = ["center", "corner", "progress"] as const;
type Mode = (typeof modes)[number];
const isMode = (mode: unknown): mode is Mode => modes.includes(mode as Mode);

const PixelsPage: NextPage = () => {
  const { query } = useRouter();
  const mode = isMode(query.mode) ? query.mode : "corner";

  return (
    <PixelProvider muralId="one">
      <div
        className={classes(
          "grid h-screen w-full grid-cols-3 grid-rows-3",
          mode !== "corner" && "p-4",
        )}
      >
        <div
          className={classes(
            "@container-[size] row-span-1 row-start-3 flex flex-col justify-end gap-1",
            mode === "corner"
              ? "col-span-2 col-start-2 items-end"
              : "col-span-full items-center",
          )}
        >
          <div
            className={classes(
              "flex shrink-0 flex-row items-center justify-between text-nowrap",
              mode !== "progress" &&
                "rounded-t bg-alveus-green ring-4 ring-alveus-green",
            )}
            style={{
              width:
                mode === "progress"
                  ? "100%"
                  : `min(100cqw, calc(${PIXEL_GRID_WIDTH / PIXEL_GRID_HEIGHT} * (100cqh - 1lh - var(--spacing))))`,
            }}
          >
            <p className="min-w-0 shrink overflow-hidden px-1 font-bold text-ellipsis text-white tabular-nums text-stroke">
              {query.text ??
                "Donate $100 or more to unlock a !pixel and support the Alveus Research & Recovery !institute."}
            </p>

            <PixelsDescription className="px-1 font-bold text-white text-stroke" />
          </div>

          {mode === "progress" ? (
            <PixelsProgress className="shadow-lg" />
          ) : (
            <Pixels
              className="min-h-0 shrink"
              canvasClassName={classes(
                "ring-4 ring-alveus-green",
                mode === "corner" ? "ml-auto" : "mx-auto rounded-b shadow-lg",
              )}
            />
          )}
        </div>
      </div>
    </PixelProvider>
  );
};

export default PixelsPage;
