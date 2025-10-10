import { useEffect, useState } from "react";

export const PIXEL_SIZE = 10;
export const PIXEL_GRID_WIDTH = 200;
export const PIXEL_GRID_HEIGHT = 50;

export type Pixel = {
  data: Uint8ClampedArray<ArrayBuffer>;
  username: string;
  email: string;
  x: number;
  y: number;
};

export type StoredPixel = Omit<Pixel, "x" | "y"> | null;

const storedPixels = () => {
  const arr = new Array<StoredPixel>(PIXEL_GRID_WIDTH * PIXEL_GRID_HEIGHT);
  arr.fill(null);
  Object.seal(arr);
  return arr;
};

const usePixels = (
  callback?: (newPixels: Pixel[], allPixels: StoredPixel[]) => void,
): Readonly<StoredPixel[]> => {
  const [pixels, setPixels] = useState(storedPixels());

  // TODO: Replace with real websocket
  // const bytes = Uint8ClampedArray.from(atob(incoming.data), c => c.charCodeAt(0));
  useEffect(() => {
    const interval = setInterval(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = PIXEL_SIZE;
      canvas.height = PIXEL_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pixels: Pixel[] = [];
      const count = Math.floor(Math.random() * 9) + 1;

      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, PIXEL_SIZE, PIXEL_SIZE);

        const user = `user${Math.floor(Math.random() * 1000)}`;

        pixels.push({
          data: new Uint8ClampedArray(
            ctx.getImageData(0, 0, PIXEL_SIZE, PIXEL_SIZE).data,
          ),
          username: `@${user}`,
          email: await window.crypto.subtle
            .digest("SHA-256", new TextEncoder().encode(`${user}@example.com`))
            .then((hash) =>
              Array.from(new Uint8Array(hash))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join(""),
            ),
          x: Math.floor(Math.random() * PIXEL_GRID_WIDTH),
          y: Math.floor(Math.random() * PIXEL_GRID_HEIGHT),
        });
      }

      setPixels((oldPixels) => {
        const updatedPixels = [...oldPixels];
        pixels.forEach(({ x, y, ...pixel }) => {
          updatedPixels[y * PIXEL_GRID_WIDTH + x] = pixel;
        });

        callback?.(pixels, updatedPixels);
        return updatedPixels;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [callback]);

  return pixels;
};

export default usePixels;
