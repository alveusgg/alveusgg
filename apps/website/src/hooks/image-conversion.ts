export const useImageConverter = async (file: File) => {
  try {
    let convertedFile: File | null = null;

    if (file.type === "image/heic" || file.type === "image/heif") {
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
    }

    if (file.type === "image/avif") {
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
    }

    return convertedFile;
  } catch (error) {
    console.error(error);
    return null;
  }
};
