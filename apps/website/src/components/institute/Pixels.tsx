import { type Ref, useCallback, useEffect, useRef } from "react";

import type { DonationAlert, Pixel } from "@alveusgg/donations-core";

import { classes } from "@/utils/classes";

import {
  PIXEL_GRID_HEIGHT,
  PIXEL_GRID_WIDTH,
  PIXEL_SIZE,
  type PixelSyncContext,
  useLivePixels,
} from "@/hooks/pixels";

export const coordsToGridRef = ({ x, y }: { x: number; y: number }) => {
  // Convert y to letters (A, B, ..., Z, AA, AB, ..., ZZ, AAA, ...)
  let letters = "";
  let n = y;
  while (n >= 0) {
    letters = String.fromCharCode(65 + (n % 26)) + letters;
    n = Math.floor(n / 26) - 1;
  }

  return {
    x: x + 1,
    y: letters,
  };
};

const Pixels = ({
  filter,
  className,
  canvasClassName,
  ref,
}: {
  filter?: (
    pixel: NonNullable<Pixel>,
    index: number,
    signal: AbortSignal,
  ) => boolean | Promise<boolean>;
  className?: string;
  canvasClassName?: string;
  ref?: Ref<HTMLDivElement>;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const onEvent = useCallback((alert: DonationAlert) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;

    alert.pixels.forEach((pixel) => {
      const data = Uint8ClampedArray.from(atob(pixel.data), (c) =>
        c.charCodeAt(0),
      );
      ctx.putImageData(
        new ImageData(data, PIXEL_SIZE, PIXEL_SIZE),
        pixel.column * PIXEL_SIZE,
        pixel.row * PIXEL_SIZE,
      );
    });
  }, []);

  const onInit = useCallback((context: PixelSyncContext) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;

    for (let y = 0; y < PIXEL_GRID_HEIGHT; y++) {
      for (let x = 0; x < PIXEL_GRID_WIDTH; x++) {
        const gray = 255 - Math.floor(Math.random() * 10);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    context.pixels.forEach((pixel) => {
      const data = Uint8ClampedArray.from(atob(pixel.data), (c) =>
        c.charCodeAt(0),
      );
      ctx.putImageData(
        new ImageData(data, PIXEL_SIZE, PIXEL_SIZE),
        pixel.column * PIXEL_SIZE,
        pixel.row * PIXEL_SIZE,
      );
    });
  }, []);
  const pixels = useLivePixels({ onEvent, onInit });
  // Draw new pixels as they come in

  // Redraw filtered pixels when filter changes
  const filtered = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = filtered.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      PIXEL_GRID_WIDTH * PIXEL_SIZE,
      PIXEL_GRID_HEIGHT * PIXEL_SIZE,
    );
    if (!filter) return;

    const controller = new AbortController();
    pixels.data?.pixels.forEach(async (pixel, i) => {
      if (!pixel) return;

      if (await filter(pixel, i, controller.signal)) {
        if (controller.signal.aborted) return;

        const data = Uint8ClampedArray.from(atob(pixel.data), (c) =>
          c.charCodeAt(0),
        );
        ctx.putImageData(
          new ImageData(data, PIXEL_SIZE, PIXEL_SIZE),
          pixel.column * PIXEL_SIZE,
          pixel.row * PIXEL_SIZE,
        );
      }
    });

    return () => controller.abort();
  }, [filter, pixels]);

  const highlightTooltipRef = useRef<HTMLDivElement>(null);
  const highlightGridRefRef = useRef<HTMLParagraphElement>(null);
  const highlightIdentifierRef = useRef<HTMLParagraphElement>(null);
  const move = useCallback(
    (e: React.MouseEvent) => {
      if (
        !highlightTooltipRef.current ||
        !highlightGridRefRef.current ||
        !highlightIdentifierRef.current
      )
        return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor(
        ((e.clientX - rect.left) / rect.width) * PIXEL_GRID_WIDTH,
      );
      const y = Math.floor(
        ((e.clientY - rect.top) / rect.height) * PIXEL_GRID_HEIGHT,
      );
      const size = rect.width / PIXEL_GRID_WIDTH;

      const gridRef = coordsToGridRef({ x, y });

      highlightTooltipRef.current.style.top = `${y * size}px`;
      highlightTooltipRef.current.style.left = `${x * size}px`;
      highlightTooltipRef.current.style.width = `${size}px`;
      highlightTooltipRef.current.style.height = `${size}px`;

      const pixel = pixels.data?.pixels.find(
        (p) => p.column === x && p.row === y,
      );

      highlightTooltipRef.current.classList.remove("opacity-0");
      highlightGridRefRef.current.innerText = `${gridRef.y}:${gridRef.x}`;
      if (pixel) {
        highlightIdentifierRef.current.innerText = pixel.identifier;
        highlightIdentifierRef.current.classList.remove("italic", "opacity-75");
      } else {
        highlightIdentifierRef.current.innerText = "Locked";
        highlightIdentifierRef.current.classList.add("italic", "opacity-75");
      }
    },
    [pixels],
  );

  const exit = useCallback(() => {
    if (!highlightTooltipRef.current) return;
    highlightTooltipRef.current.classList.add("opacity-0");
  }, []);

  return (
    <div
      className={classes(
        "flex max-h-full w-full items-center justify-center pixelated",
        className,
      )}
      style={{ aspectRatio: `${PIXEL_GRID_WIDTH} / ${PIXEL_GRID_HEIGHT}` }}
      ref={ref}
    >
      <div
        className={classes(
          "relative h-full max-w-full bg-white",
          canvasClassName,
        )}
        style={{ aspectRatio: `${PIXEL_GRID_WIDTH} / ${PIXEL_GRID_HEIGHT}` }}
      >
        <canvas
          ref={canvas}
          onMouseMove={move}
          onMouseLeave={exit}
          width={PIXEL_GRID_WIDTH * PIXEL_SIZE}
          height={PIXEL_GRID_HEIGHT * PIXEL_SIZE}
          className={classes(
            "absolute inset-0 block size-full transition-[filter]",
            (canvasClassName || "").match(
              /(?:^| )(rounded(?:-[^ ]+)?)(?: |$)/,
            )?.[1],
            filter && "contrast-50 grayscale-100",
          )}
        />

        <canvas
          ref={filtered}
          width={PIXEL_GRID_WIDTH * PIXEL_SIZE}
          height={PIXEL_GRID_HEIGHT * PIXEL_SIZE}
          className={classes(
            "pointer-events-none absolute inset-0 block size-full transition-[background-color]",
            (canvasClassName || "").match(
              /(?:^| )(rounded(?:-[^ ]+)?)(?: |$)/,
            )?.[1],
            filter && "bg-black/90",
          )}
        />

        <div
          ref={highlightTooltipRef}
          className={classes(
            "pointer-events-none absolute opacity-0 ring-2 ring-highlight",
          )}
        >
          <div className="absolute top-1/2 right-full mr-2 flex -translate-y-1/2 flex-col rounded bg-alveus-green/75 px-2 py-1 text-sm leading-tight whitespace-nowrap text-alveus-tan backdrop-blur-sm">
            <p
              ref={highlightGridRefRef}
              className="font-mono text-xs opacity-75"
            ></p>
            <p ref={highlightIdentifierRef}></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pixels;
