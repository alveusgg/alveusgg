export const fileToBase64 = (file: File): Promise<string> => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.readAsDataURL(file);
  });
};

export const fileToImage = (file: File): Promise<HTMLImageElement> => {
  const image = new Image();
  return new Promise((resolve) => {
    image.addEventListener("load", () => resolve(image));
    image.src = URL.createObjectURL(file);
  });
};
