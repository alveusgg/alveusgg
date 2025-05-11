import type { Dispatch, SetStateAction } from "react";

import type { ImageMimeType } from "./files";

async function convertHeicToJpeg(file: File) {
  const heic2any = (await import("heic2any")).default;

  const blob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  return new File([blob as Blob], file.name.replace(/\.[^.]+$/, ".jpeg"), {
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

const conversionFunctions: Partial<
  Record<ImageMimeType, (file: File) => Promise<File>>
> = {
  "image/heic": convertHeicToJpeg,
  "image/heif": convertHeicToJpeg,
  "image/avif": convertAvifToJpeg,
};

function isConvertibleMimeType(
  mimeType: string,
): mimeType is keyof typeof conversionFunctions & ImageMimeType {
  return mimeType in conversionFunctions;
}

export async function imageConverter(
  file: File,
  setIsConvertingFile: Dispatch<SetStateAction<boolean>>,
  setImageConversionError: Dispatch<SetStateAction<string | null>>,
) {
  if (isConvertibleMimeType(file.type)) {
    const converter = conversionFunctions[file.type];

    if (!converter) return file;
    setIsConvertingFile(true);
    return converter(file)
      .then((convertedFile) => {
        setIsConvertingFile(false);
        return convertedFile;
      })
      .catch((error) => {
        setImageConversionError(
          `Error converting image (${file.type}) to JPEG`,
        );
        console.error(error);
        return;
      })
      .finally(() => {
        setIsConvertingFile(false);
      });
  }
  return file;
}
