import sharp, { type FormatEnum } from "sharp";

import type { ImageMimeType } from "@/utils/files";

const mimeTypes: Partial<Record<keyof FormatEnum, ImageMimeType>> = {
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export async function inspectImage(data: Uint8Array) {
  try {
    const image = sharp(data, {
      failOn: "error",
      // Browser uploads are resized to at most 2048px per side. Limit decoded
      // work too, since a small compressed file can contain many more pixels.
      limitInputPixels: 2048 * 2048,
    });
    const { format, compression, autoOrient } = await image.metadata();

    const mimeType =
      format === "heif"
        ? compression === "av1"
          ? "image/avif"
          : "image/heic"
        : mimeTypes[format];
    if (!mimeType) return false;

    // Decode the whole image, so files that only start like an image or are
    // truncated/corrupt are rejected
    await image.stats();

    return { mimeType, width: autoOrient.width, height: autoOrient.height };
  } catch (_) {
    return false;
  }
}
