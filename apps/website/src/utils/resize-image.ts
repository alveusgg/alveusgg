import invariant from "@/utils/invariant";
import type { ImageMimeType } from "@/utils/files";

export type ResizeImageOptions = {
  type: ImageMimeType;
  maxWidth: number;
  maxHeight: number;
  quality: number;
};

export async function resizeImage(
  imageSrc: string,
  { type, maxWidth, maxHeight, quality }: ResizeImageOptions,
): Promise<null | { blob: Blob; dataURL: string }> {
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

      const canvas = renderImageCanvas(image, { width, height });
      const dataURL = canvas.toDataURL(type, quality / 100);
      canvas.toBlob(
        (blob) => {
          resolve(blob ? { blob, dataURL } : null);
        },
        type,
        quality / 100,
      );
    };
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
  return canvas;
}
