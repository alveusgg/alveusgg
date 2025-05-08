import type { Dispatch, SetStateAction } from "react";

async function convertHeicToJpeg(file: File) {
  let convertedFile: File | null = null;
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  convertedFile = new File(
    [blob as Blob],
    file.name.replace(/\.[^.]+$/, "jpeg"),
    {
      type: "image/jpeg",
    },
  );
  return convertedFile;
}

async function convertAvifToJpeg(file: File) {
  let convertedFile: File | null = null;
  convertedFile = await new Promise((resolve, reject) => {
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
            new File([blob], file.name.replace(/\.avif$/i, ".jpg"), {
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
  return convertedFile;
}
type SupportedMimeTypes = "image/heic" | "image/heif" | "image/avif";

const conversionFunctions: Record<
  SupportedMimeTypes,
  (file: File) => Promise<File | null>
> = {
  "image/heic": convertHeicToJpeg,
  "image/heif": convertHeicToJpeg,
  "image/avif": convertAvifToJpeg,
};

export async function imageConverter(
  file: File,
  setIsConvertingFile: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
) {
  let convertedFile: File | null = null;

  const converter = conversionFunctions[file.type as SupportedMimeTypes];
  if (converter) {
    setIsConvertingFile(true);
    try {
      convertedFile = await converter(file);
      return convertedFile;
    } catch (error) {
      setError(`Error converting image (${file.type}) to JPEG`);
      return null;
    } finally {
      setIsConvertingFile(false);
    }
  }
  return null;
}
