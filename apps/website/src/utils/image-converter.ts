export async function imageConverter(file: File) {
  try {
    console.log("Converting image to jpeg");
    const response = await fetch("/api/convert-image", {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Image conversion failed");
    }

    const blob = await response.blob();
    return new File([blob], file.name.replace(/\.[^.]+$/, "jpeg"), {
      type: "image/jpeg",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
