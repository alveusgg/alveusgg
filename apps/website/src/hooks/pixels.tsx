import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import type { PublicPixel } from "@/server/db/donations";

import grid from "@/data/pixel-project-grid.json";

export type Pixel = PublicPixel & { data: string };

export const PIXEL_SIZE = 3;
export const PIXEL_GRID_WIDTH = 200;
export const PIXEL_GRID_HEIGHT = 50;
export const PIXEL_TOTAL = PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT;

export const PIXEL_IDENTIFIER_MIN_LENGTH = 2;
export const PIXEL_IDENTIFIER_MAX_LENGTH = 32;

// FIXME: INCREASE LOCK DURATION TO 24 HOURS
export const PIXEL_RENAME_LOCK_DURATION_TEXT = "1 minute"; // For display purposes
export const PIXEL_RENAME_LOCK_DURATION_MS = 60 * 1000;

export function normalizePixelIdentifier(ident: string) {
  let normalized = ident
    .replace(
      // Emoji Unicode Ranges
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      "",
    )
    .replace(/[^\S\r\n]+/g, " ") // Replace multiple spaces/tabs with a single space
    .replace(/\r?\n+/g, "\n") // Replace multiple line breaks with a single line break
    .replace(/[^\x20-\x7E]/g, ""); // Remove other non-printable characters

  // Only keep the first line break and replace subsequent line breaks with spaces
  const firstLineBreakIndex = normalized.indexOf("\n");
  if (firstLineBreakIndex !== -1) {
    const before = normalized.slice(0, firstLineBreakIndex + 1);
    const after = normalized.slice(firstLineBreakIndex + 1).replace(/\n/g, " ");
    normalized = before + after;
  }

  return normalized;
}

export const pixelIdentifierSchema = z
  .string()
  .trim()
  .min(PIXEL_IDENTIFIER_MIN_LENGTH)
  .max(PIXEL_IDENTIFIER_MAX_LENGTH)
  .transform(normalizePixelIdentifier);

const getPixels = async () => {
  const response = await fetch("/api/pixels");
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Failed to get pixels");
  }
  const pixels = data as Pixel[];
  return pixels.map((pixel) => {
    const location =
      `${pixel.column}:${pixel.row}` as keyof typeof grid.squares;
    return { ...pixel, data: grid.squares[location] };
  });
};

export const usePixels = () => {
  const query = useQuery({
    queryKey: ["pixels"],
    queryFn: getPixels,
  });
  return query.data;
};
