import { heicTo } from "heic-to/csp";

import type { ImageMimeType } from "./files";

async function convertHeicToJpeg(file: File) {
  const blob = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.9,
  });

  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpeg"), {
    type: "image/jpeg",
  });
}

async function convertAvifToJpeg(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Conversion to JPEG failed"));
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.avif$/i, ".jpeg"), {
              type: "image/jpeg",
            }),
          );
        },
        "image/jpeg",
        0.9,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load AVIF image"));
    };

    img.src = url;
  });
}

const converters = {
  "image/heic": convertHeicToJpeg,
  "image/heif": convertHeicToJpeg,
  "image/avif": convertAvifToJpeg,
} as const satisfies Partial<
  Record<ImageMimeType, (file: File) => Promise<File>>
>;

const hasConverter = (mimeType: string): mimeType is keyof typeof converters =>
  mimeType in converters;

export async function imageConverter(file: File) {
  if (hasConverter(file.type)) {
    const converter = converters[file.type];

    try {
      return await converter(file);
    } catch (e) {
      console.error(e);
      throw new Error(`Error converting image (${file.type}) to JPEG`, {
        cause: e,
      });
    }
  }
  return file;
}
