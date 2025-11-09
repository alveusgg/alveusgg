import {
  type ComponentProps,
  type MouseEvent,
  type Ref,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { PIXEL_GRID_HEIGHT, PIXEL_GRID_WIDTH, PIXEL_SIZE } from "@/data/murals";

import { classes } from "@/utils/classes";

import { type Pixel, usePixels, usePixelsKey } from "@/hooks/pixels";

import PixelPreview, {
  type PixelPreviewRef,
} from "@/components/institute/PixelPreview";

import IconLoading from "@/icons/IconLoading";

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

function positionTooltip(el: Element, x: number, y: number) {
  if (x > PIXEL_GRID_WIDTH / 2) {
    el.classList.add("right-full");
    el.classList.remove("left-full");
  } else {
    el.classList.add("left-full");
    el.classList.remove("right-full");
  }

  if (y < PIXEL_GRID_HEIGHT / 3) {
    el.classList.add("top-full");
    el.classList.remove("bottom-full", "top-1/2", "-translate-y-1/2");
  } else if (y > (2 * PIXEL_GRID_HEIGHT) / 3) {
    el.classList.add("bottom-full");
    el.classList.remove("top-full", "top-1/2", "-translate-y-1/2");
  } else {
    el.classList.add("top-1/2", "-translate-y-1/2");
    el.classList.remove("top-full", "bottom-full");
  }
}

const PixelsInternal = ({
  filter,
  onFilter,
  className,
  canvasClassName,
  ref,
}: {
  filter?: (pixel: Pixel, signal: AbortSignal) => boolean | Promise<boolean>;
  onFilter?: (pixel: Pixel[]) => void;
  className?: string;
  canvasClassName?: string;
  ref?: Ref<HTMLDivElement>;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawn = useRef<Set<string>>(new Set());
  const pixels = usePixels();

  // Draw new pixels when we get them
  useEffect(() => {
    if (!pixels) return;

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;

    pixels.forEach((pixel) => {
      const key = `${pixel.column}:${pixel.row}`;
      if (drawn.current.has(key)) return;
      drawn.current.add(key);

      const data = Uint8ClampedArray.from(atob(pixel.data), (c) =>
        c.charCodeAt(0),
      );
      ctx.putImageData(
        new ImageData(data, PIXEL_SIZE, PIXEL_SIZE),
        pixel.column * PIXEL_SIZE,
        pixel.row * PIXEL_SIZE,
      );
    });
  }, [pixels]);

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

    Promise.all(
      pixels?.map(async (pixel) => {
        const match = await filter(pixel, controller.signal);
        if (controller.signal.aborted || !match) return;
        return pixel;
      }) || [],
    ).then(async (filtered) => {
      if (controller.signal.aborted) return;

      const filteredPixels = filtered.filter((p): p is Pixel => !!p);
      onFilter?.(filteredPixels);

      if (controller.signal.aborted) return;

      // Draw glow, but only if we have less than 200 pixels to draw
      if (filteredPixels.length <= 200) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.filter = "blur(1px)";
        filteredPixels.forEach((pixel) => {
          ctx.fillRect(
            pixel.column * PIXEL_SIZE - 1,
            pixel.row * PIXEL_SIZE - 1,
            PIXEL_SIZE + 2,
            PIXEL_SIZE + 2,
          );
        });
        ctx.filter = "none";
      }

      // Draw the actual pixels
      for (let i = 0; i < filteredPixels.length; i++) {
        const pixel = filteredPixels[i];
        if (controller.signal.aborted || !pixel) continue;

        const data = Uint8ClampedArray.from(atob(pixel.data), (c) =>
          c.charCodeAt(0),
        );
        ctx.putImageData(
          new ImageData(data, PIXEL_SIZE, PIXEL_SIZE),
          pixel.column * PIXEL_SIZE,
          pixel.row * PIXEL_SIZE,
        );

        if (i % 500 === 0) {
          await new Promise(requestAnimationFrame);
        }
      }
    });

    return () => controller.abort();
  }, [filter, onFilter, pixels]);

  const pixelPreviewRef = useRef<PixelPreviewRef>(null);

  const highlightTooltipRef = useRef<HTMLDivElement>(null);
  const highlightGridRefRef = useRef<HTMLParagraphElement>(null);
  const move = useCallback((e: MouseEvent) => {
    if (!highlightTooltipRef.current || !highlightGridRefRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(
      ((e.clientX - rect.left) / rect.width) * PIXEL_GRID_WIDTH,
    );
    const y = Math.floor(
      ((e.clientY - rect.top) / rect.height) * PIXEL_GRID_HEIGHT,
    );

    // prevent negative coords
    if (x < 0 || y < 0) return;

    const size = rect.width / PIXEL_GRID_WIDTH;

    const gridRef = coordsToGridRef({ x, y });

    highlightTooltipRef.current.style.top = `${y * size}px`;
    highlightTooltipRef.current.style.left = `${x * size}px`;
    highlightTooltipRef.current.style.width = `${size}px`;
    highlightTooltipRef.current.style.height = `${size}px`;

    highlightTooltipRef.current.classList.remove("opacity-0");
    highlightGridRefRef.current.innerText = `${gridRef.y}:${gridRef.x}`;

    // Decide which side to place the tooltip on (left/right)
    const innerTooltipDiv = highlightTooltipRef.current.children[0];
    if (innerTooltipDiv) {
      positionTooltip(innerTooltipDiv, x, y);
    }

    pixelPreviewRef.current?.setPixel({ x, y });
  }, []);

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
          "relative z-40 h-full max-w-full bg-gray-200",
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
            !pixels && "pointer-events-none",
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
            filter && "bg-alveus-green-900/60",
          )}
        />

        <div
          ref={highlightTooltipRef}
          className="pointer-events-none absolute z-40 opacity-0 ring-2 ring-highlight"
        >
          <div className="absolute mx-2 flex flex-col gap-2 rounded bg-alveus-green/75 p-2 text-sm leading-tight whitespace-nowrap text-alveus-tan backdrop-blur-sm">
            <p
              ref={highlightGridRefRef}
              className="font-mono text-xs opacity-75"
            />
            <PixelPreview ref={pixelPreviewRef} />
          </div>
        </div>

        <IconLoading
          className={classes(
            "pointer-events-none absolute top-1/2 left-1/2 -translate-1/2 transition-opacity",
            pixels && "opacity-0",
          )}
        />
      </div>
    </div>
  );
};

const Pixels = (props: ComponentProps<typeof PixelsInternal>) => {
  const key = usePixelsKey();
  return <PixelsInternal key={key.join()} {...props} />;
};

export default Pixels;
