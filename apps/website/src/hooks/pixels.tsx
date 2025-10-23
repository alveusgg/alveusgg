import { useQuery } from "@tanstack/react-query";

import type { Pixel as DatabasePixel } from "@alveusgg/database";

import grid from "@/data/pixel-project-grid.json";

export type Pixel = DatabasePixel & { data: string };

export const PIXEL_SIZE = 3;
export const PIXEL_GRID_WIDTH = 200;
export const PIXEL_GRID_HEIGHT = 50;
export const PIXEL_TOTAL = PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT;

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
