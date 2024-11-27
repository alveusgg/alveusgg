export type ImageMimeType = (typeof imageMimeTypes)[number];
export const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
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
