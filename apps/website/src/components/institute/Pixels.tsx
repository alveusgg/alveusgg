import { type Ref, useCallback, useEffect, useRef, useState } from "react";

import { classes } from "@/utils/classes";

import usePixels, {
  PIXEL_GRID_HEIGHT,
  PIXEL_GRID_WIDTH,
  PIXEL_SIZE,
  type Pixel,
  type StoredPixel,
} from "@/hooks/pixels";

const coordsToGridRef = ({ x, y }: { x: number; y: number }) => {
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
  onChange,
  filter,
  className,
  canvasClassName,
  ref,
}: {
  onChange?: (newPixels: Pixel[], allPixels: StoredPixel[]) => void;
  filter?: (
    pixel: NonNullable<StoredPixel>,
    index: number,
    signal: AbortSignal,
  ) => boolean | Promise<boolean>;
  className?: string;
  canvasClassName?: string;
  ref?: Ref<HTMLDivElement>;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  // Draw new pixels as they come in
  const pixels = usePixels(
    useCallback(
      (newPixels: Pixel[], allPixels: StoredPixel[]) => {
        onChange?.(newPixels, allPixels);

        const ctx = canvas.current?.getContext("2d");
        if (!ctx) return;

        newPixels.forEach((pixel) =>
          ctx.putImageData(
            new ImageData(pixel.data, PIXEL_SIZE, PIXEL_SIZE),
            pixel.x * PIXEL_SIZE,
            pixel.y * PIXEL_SIZE,
          ),
        );
      },
      [onChange],
    ),
  );

  // Fill background with near-white noise on mount
  useEffect(() => {
    if (!canvas.current) return;

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    for (let y = 0; y < PIXEL_GRID_HEIGHT; y++) {
      for (let x = 0; x < PIXEL_GRID_WIDTH; x++) {
        const gray = 255 - Math.floor(Math.random() * 10);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }
  }, []);

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
    pixels.forEach(async (pixel, i) => {
      if (!pixel) return;

      if (await filter(pixel, i, controller.signal)) {
        if (controller.signal.aborted) return;

        const x = i % PIXEL_GRID_WIDTH;
        const y = Math.floor(i / PIXEL_GRID_WIDTH);
        ctx.putImageData(
          new ImageData(pixel.data, PIXEL_SIZE, PIXEL_SIZE),
          x * PIXEL_SIZE,
          y * PIXEL_SIZE,
        );
      }
    });

    return () => controller.abort();
  }, [filter, pixels]);

  const [highlight, setHighlight] = useState<{
    x: number;
    y: number;
    size: number;
  }>();
  const highlightGridRef = highlight ? coordsToGridRef(highlight) : null;
  const highlightPixel = highlight
    ? pixels[highlight.y * PIXEL_GRID_WIDTH + highlight.x]
    : undefined;
  const move = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHighlight({
      x: Math.floor(((e.clientX - rect.left) / rect.width) * PIXEL_GRID_WIDTH),
      y: Math.floor(((e.clientY - rect.top) / rect.height) * PIXEL_GRID_HEIGHT),
      size: rect.width / PIXEL_GRID_WIDTH,
    });
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
          onMouseLeave={() => setHighlight(undefined)}
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
          className={classes(
            "pointer-events-none absolute ring-2 ring-highlight",
            highlight ? "opacity-100" : "opacity-0",
          )}
          style={{
            top: highlight ? highlight.y * highlight.size : 0,
            left: highlight ? highlight.x * highlight.size : 0,
            width: highlight?.size || 0,
            height: highlight?.size || 0,
          }}
        >
          <div className="absolute top-1/2 right-full mr-2 flex -translate-y-1/2 flex-col rounded bg-alveus-green/75 px-2 py-1 text-sm leading-tight whitespace-nowrap text-alveus-tan backdrop-blur-sm">
            {highlightGridRef && (
              <p className="font-mono text-xs opacity-75">
                {highlightGridRef.y}:{highlightGridRef.x}
              </p>
            )}
            {highlightPixel ? (
              <p>{highlightPixel.username}</p>
            ) : (
              <p className="italic opacity-75">Locked</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pixels;
