export type ImageMimeType = (typeof imageMimeTypes)[number];
export const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
] as const satisfies Array<`image/${string}`>;

export const isImageMimeType = (type: string): type is ImageMimeType =>
  imageMimeTypes.includes(type as ImageMimeType);

export function getImageMimeType(fileType: string): ImageMimeType | false {
  fileType = fileType.toLowerCase();
  return isImageMimeType(fileType) ? fileType : false;
}

export function getFileEndingForImageMimeType(fileType: ImageMimeType) {
  return fileType.replace("image/", "");
}

export const fileToBase64 = (file: File): Promise<string> => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.readAsDataURL(file);
  });
};

function normalizeFileNamePart(str: string) {
  return str
    .normalize("NFKD") // Normalize to NFKD
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
}

export function normalizeFileName(fileName: string, maxLength = 30) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const hasExtension = lastDotIndex !== -1;
  const extension = hasExtension && fileName.substring(lastDotIndex);
  const nameWithoutExtension = hasExtension
    ? fileName.substring(0, lastDotIndex)
    : fileName;
  const safeName = normalizeFileNamePart(nameWithoutExtension).substring(
    0,
    maxLength,
  );
  const safeExtension =
    extension && normalizeFileNamePart(extension).substring(0, 4);
  return `${safeName || "file"}${safeExtension ? `.${safeExtension}` : ""}`;
}
