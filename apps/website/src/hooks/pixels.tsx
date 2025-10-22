import type { Pixel as DatabasePixel } from "@alveusgg/database";

import grid from "@/data/pixel-project-grid.json";

import { trpc } from "@/utils/trpc";

export type Pixel = DatabasePixel & { data: string };

export const PIXEL_SIZE = 3;
export const PIXEL_GRID_WIDTH = 200;
export const PIXEL_GRID_HEIGHT = 50;
export const PIXEL_TOTAL = PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT;

export const usePixels = () => {
  const pixels = trpc.donations.getPixels.useQuery();
  return pixels.data?.map((pixel) => {
    const location =
      `${pixel.column}:${pixel.row}` as keyof typeof grid.squares;
    return {
      ...pixel,
      data: grid.squares[location],
    };
  });
};
