import { sync as probe } from "probe-image-size";

import { isImageMimeType } from "@/utils/files";

export function probeImageMeta(data: Uint8Array) {
  try {
    // Read headers only; uploaded pixels are never decoded in this process.
    const image = probe(Buffer.from(data));
    if (!image || !isImageMimeType(image.mime)) return false;

    const { width, height, orientation, mime } = image;
    const isRotated = (orientation ?? 0) > 4;

    return {
      width: isRotated ? height : width,
      height: isRotated ? width : height,
      mimeType: mime,
    };
  } catch (_) {
    return false;
  }
}
