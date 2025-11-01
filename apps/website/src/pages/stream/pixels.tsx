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
import PixelsAlert from "@/components/overlay/PixelsAlert";

const modes = ["center", "corner", "progress", "alert"] as const;
type Mode = (typeof modes)[number];
const isMode = (mode: unknown): mode is Mode => modes.includes(mode as Mode);

const alertVariants = [
  "none",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;
type AlertVariant = (typeof alertVariants)[number];
const isAlertVariant = (variant: unknown): variant is AlertVariant =>
  alertVariants.includes(variant as AlertVariant);

const PixelsPage: NextPage = () => {
  const { query } = useRouter();
  const mode = isMode(query.mode) ? query.mode : "corner";

  if (mode === "alert") {
    return (
      <PixelProvider muralId="two">
        <PixelsAlert />
      </PixelProvider>
    );
  }

  const alertVariant = isAlertVariant(query.alert) ? query.alert : "top-left";
  const showAlert = alertVariant !== "none";

  return (
    <PixelProvider muralId="two">
      {showAlert && (
        <div
          className={classes(
            "absolute z-50 overflow-hidden",
            alertVariant === "top-left" && "top-0 left-0",
            alertVariant === "top-right" && "top-0 right-0",
            alertVariant === "bottom-left" && "bottom-0 left-0",
            alertVariant === "bottom-right" && "right-0 bottom-0",
            mode === "progress" && "mb-24",
          )}
        >
          <PixelsAlert />
        </div>
      )}

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
