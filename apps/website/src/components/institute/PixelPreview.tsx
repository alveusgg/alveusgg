import {
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";

import { PIXEL_SIZE } from "@/data/murals";

import { type Pixel, usePixels } from "@/hooks/pixels";

function getHighContrastColor(pixel: Pixel, opacity = 1) {
  const bytes = Uint8ClampedArray.from(atob(pixel.data), (c) =>
    c.charCodeAt(0),
  );
  let averageLuminosity = 0;
  // RGBA, ignore alpha
  for (let i = 0; i < bytes.length; i += 4) {
    const r = bytes[i];
    const g = bytes[i + 1];
    const b = bytes[i + 2];
    if (!r || !g || !b) continue;
    averageLuminosity += r;
    averageLuminosity += g;
    averageLuminosity += b;
  }
  averageLuminosity /= (bytes.length / 4) * 3;
  return averageLuminosity < 128
    ? `rgba(255, 255, 255, ${opacity})`
    : `rgba(0, 0, 0, ${opacity})`;
}

function wrapCanvasText(
  measure: (text: string) => number,
  text: string,
  maxWidth: number,
) {
  if (text.includes("\n")) {
    throw new Error("wrapCanvasText does not support new lines");
  }

  // Split the text into individual words with separators
  const locale = Intl?.Segmenter?.supportedLocalesOf("en-US")[0];
  const words = locale
    ? Array.from(
        new Intl.Segmenter(locale, { granularity: "word" }).segment(text),
        (s) => s.segment,
      )
    : text
        .split(" ")
        .flatMap((word, idx) => (idx === 0 ? [word] : [" ", word]));

  // Track the final constructed lines, and the current line being built
  const lines: string[] = [];
  const line: string[] = [];

  // Work through all the words one by one
  while (words.length > 0) {
    const word = words.shift()!;

    // If the current line is empty and this word is just whitespace, skip it
    if (line.length === 0 && /^\s+$/.test(word)) continue;

    // If adding this word to the current line will fit, add it and continue to the next word
    if (measure(line.join("") + word) <= maxWidth) {
      line.push(word);
      continue;
    }

    // If the line is empty, we're going to need to truncate this word
    if (line.length === 0) {
      const chars = locale
        ? Array.from(
            new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(
              word,
            ),
            (s) => s.segment,
          )
        : Array.from(word);

      while (measure(chars.join("") + "…") > maxWidth && chars.length > 0) {
        chars.pop();
      }

      line.push(chars.join("") + "…");
      continue;
    }

    // Otherwise, push the current line and start a new one, and then try again with this word
    lines.push(line.join(""));
    while (line.length > 0) line.pop();
    words.unshift(word);
  }

  // Push any remaining text as the last line
  if (line.length > 0) lines.push(line.join(""));

  return lines;
}

export function renderPixelPreview(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  { x, y }: { x: number; y: number },
  pixels?: Pixel[],
  identifier?: string,
) {
  const pixel = pixels?.find((p) => p.column === x && p.row === y);

  if (pixel) {
    // Draw the raw pixel data offscreen
    const bytes = Uint8ClampedArray.from(atob(pixel.data), (c) =>
      c.charCodeAt(0),
    );
    const imageData = new ImageData(bytes, PIXEL_SIZE, PIXEL_SIZE);
    const offscreen = new OffscreenCanvas(PIXEL_SIZE, PIXEL_SIZE);
    const offscreenCtx = offscreen.getContext("2d");
    if (!offscreenCtx) throw new Error("Offscreen canvas context is not found");
    offscreenCtx.putImageData(imageData, 0, 0);

    // Scale up the pixel data to fill the canvas
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      offscreen,
      0,
      0,
      offscreen.width,
      offscreen.height,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );
    ctx.imageSmoothingEnabled = true;
  } else {
    // Fill with light gray
    ctx.fillStyle = "rgb(230, 230, 230)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // Use the font family from the canvas element
  const padding = ctx.canvas.width * 0.05;
  const fontSize = ctx.canvas.width * 0.1;
  const lineHeight = fontSize * 1.2;
  const fontStyle = pixel ? "bold" : "italic bold";
  ctx.font = `${fontStyle} ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;

  // Improve text rendering quality
  ctx.textRendering = "optimizeLegibility";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the identifier (or locked) text bottom-right
  const maxTextWidth = ctx.canvas.width - padding * 2;
  const text = pixel ? (identifier ?? pixel.identifier) : "Locked";
  const lines = text
    .split("\n")
    .flatMap((line) =>
      wrapCanvasText((t) => ctx.measureText(t).width, line, maxTextWidth),
    );
  ctx.fillStyle = pixel
    ? getHighContrastColor(pixel, 0.65)
    : "rgba(0, 0, 0, 0.65)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  lines.forEach((line, index) => {
    ctx.fillText(
      line,
      ctx.canvas.width - padding,
      ctx.canvas.height - padding - (lines.length - 1 - index) * lineHeight,
    );
  });
}

export type PixelPreviewRef = {
  setPixel: (coordinates: { x: number; y: number }) => void;
};

function PixelPreview({
  x,
  y,
  ref,
  identifier,
}: {
  x?: number;
  y?: number;
  ref?: Ref<PixelPreviewRef>;
  identifier?: string;
}) {
  const pixels = usePixels();
  const canvas = useRef<HTMLCanvasElement>(null);
  const coordinates = useRef<{ x: number; y: number } | null>(null);

  const update = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      coordinates.current = { x, y };

      const elm = canvas.current;
      if (!elm) throw new Error("Canvas element is not found");

      const ctx = elm.getContext("2d");
      if (!ctx) throw new Error("Canvas context is not found");

      // Scale the canvas using the device pixel ratio for high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = ctx.canvas.offsetWidth;
      const displayHeight = ctx.canvas.offsetHeight;
      ctx.canvas.width = displayWidth * dpr;
      ctx.canvas.height = displayHeight * dpr;

      renderPixelPreview(ctx, { x, y }, pixels, identifier);
    },
    [identifier, pixels],
  );

  useImperativeHandle(ref, () => ({
    setPixel({ x, y }) {
      update({ x, y });
    },
  }));

  useEffect(() => {
    if (coordinates.current) update(coordinates.current);
  }, [update]);

  useLayoutEffect(() => {
    if (x !== undefined && y !== undefined) {
      update({ x, y });
    }
  }, [x, y, update]);

  return <canvas className="h-[200px] w-[200px]" ref={canvas} />;
}

export default PixelPreview;
