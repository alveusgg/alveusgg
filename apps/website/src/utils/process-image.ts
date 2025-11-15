import type { ImageMimeType } from "@/utils/files";
import invariant from "@/utils/invariant";
import { mmcq } from "@/utils/mmcq";

export type ResizeImageOptions = {
  type: ImageMimeType;
  maxWidth: number;
  maxHeight: number;
  quality: number;
};

export async function resizeImage(
  imageSrc: string,
  { type, maxWidth, maxHeight, quality }: ResizeImageOptions,
): Promise<null | { blob: Blob; dataURL: string; extractColor: () => string }> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      let { width, height } = image;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const { canvas, ctx } = renderImageCanvas(image, { width, height });
      const dataURL = canvas.toDataURL(type, quality / 100);
      const extractColor = () => {
        const { data } = ctx.getImageData(0, 0, width, height);

        const dominantColor = mmcq(data);

        return dominantColor.join(",");
      };
      canvas.toBlob(
        (blob) => {
          resolve(blob ? { blob, dataURL, extractColor } : null);
        },
        type,
        quality / 100,
      );
    };
  });
}

export async function extractColorFromImage(imageSrc: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const { height, width } = image;

      const { ctx } = renderImageCanvas(image, { height, width });

      const { data } = ctx.getImageData(0, 0, width, height);

      const dominantColor = mmcq(data);

      resolve(dominantColor.join(","));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

function renderImageCanvas(
  image: HTMLImageElement,
  { width, height }: { width: number; height: number },
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  invariant(ctx, "Canvas could not be created!");

  if (ctx.imageSmoothingEnabled && ctx.imageSmoothingQuality) {
    ctx.imageSmoothingQuality = "high";
  }

  ctx.drawImage(image, 0, 0, width, height);
  return { canvas, ctx };
}
