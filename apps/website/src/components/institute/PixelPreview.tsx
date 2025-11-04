import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";

import { PIXEL_SIZE, type Pixel, usePixels } from "@/hooks/pixels";

function getHighContrastColor(pixel: Pixel) {
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
  return averageLuminosity < 128 ? "white" : "black";
}

function _wrapCanvasText(
  measure: (text: string) => number,
  text: string,
  maxWidth: number,
) {
  if (text.includes("\n")) {
    throw new Error("wrapCanvasText does not support new lines");
  }

  // Split the text into individual words with separators
  const locale = Intl?.Segmenter?.supportedLocalesOf("en-US");
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
  identifier?: ReactNode;
}) {
  const pixels = usePixels();
  const myPixelRef = useRef<HTMLCanvasElement>(null);
  const identifierRef = useRef<HTMLParagraphElement>(null);

  const coordinatesRef = useRef<{ x: number; y: number } | null>(null);

  const hasIdentifier = identifier !== null && identifier !== undefined;

  const update = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      coordinatesRef.current = { x, y };

      const pixel = pixels?.find((p) => p.column === x && p.row === y);
      const identifierElement = identifierRef?.current;
      if (identifierElement) {
        if (pixel) {
          const highContrastColor = getHighContrastColor(pixel);
          if (!hasIdentifier) identifierElement.innerText = pixel.identifier;
          if (highContrastColor === "white") {
            identifierElement.style.color = "rgba(255, 255, 255, 0.9)";
          } else {
            identifierElement.style.color = "rgba(0, 0, 0, 0.9)";
          }
          identifierElement.classList.remove("italic");
        } else {
          if (!hasIdentifier) identifierElement.innerText = "Locked";
          identifierElement.classList.add("italic");
          identifierElement.style.color = "rgba(0, 0, 0, 0.9)";
        }
      }

      const myPixelCanvas = myPixelRef?.current;
      if (myPixelCanvas) {
        const ctx = myPixelCanvas.getContext("2d");
        if (!ctx) throw new Error("Pixel image canvas context is not found");
        if (pixel) {
          const bytes = Uint8ClampedArray.from(atob(pixel.data), (c) =>
            c.charCodeAt(0),
          );
          const imageData = new ImageData(bytes, PIXEL_SIZE, PIXEL_SIZE);
          ctx.putImageData(imageData, 0, 0);
        } else {
          // fill with light gray
          ctx.fillStyle = "rgb(230, 230, 230)";
          ctx.fillRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    },
    [hasIdentifier, pixels],
  );

  useImperativeHandle(ref, () => ({
    setPixel({ x, y }) {
      update({ x, y });
    },
  }));

  useEffect(() => {
    if (coordinatesRef.current) update(coordinatesRef.current);
  }, [update]);

  useLayoutEffect(() => {
    if (x !== undefined && y !== undefined) {
      update({ x, y });
    }
  }, [x, y, update]);

  return (
    <div className="relative flex h-[200px] w-[200px] flex-col justify-end">
      <canvas
        className="absolute inset-0 h-full w-full"
        ref={myPixelRef}
        style={{ imageRendering: "pixelated" }}
        width={PIXEL_SIZE}
        height={PIXEL_SIZE}
      />
      <p
        className="relative z-10 max-w-full self-end overflow-hidden p-4 text-right text-lg font-bold text-ellipsis whitespace-pre-line opacity-75"
        ref={identifierRef}
      >
        {identifier}
      </p>
    </div>
  );
}

export default PixelPreview;
