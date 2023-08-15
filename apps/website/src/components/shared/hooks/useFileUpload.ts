type FileSignature<AllowedFileType extends string = string> = {
  fileName: string;
  fileType: AllowedFileType;
};
type SignedUploadInfo = {
  fileStorageObjectId: string;
  uploadUrl: string;
  viewUrl: string;
};

type CreateFileUpload<
  AllowedFileTypes extends readonly string[] = readonly string[],
> = (
  signature: FileSignature<AllowedFileTypes[number]>,
) => Promise<SignedUploadInfo>;

export function useFileUpload<
  AllowedFileTypes extends readonly string[] = readonly string[],
>(
  createFileUpload: CreateFileUpload<AllowedFileTypes>,
  options: { allowedFileTypes?: AllowedFileTypes } = {},
) {
  return async (file: File) => {
    const fileType = file.type as AllowedFileTypes[number];
    if (
      options.allowedFileTypes &&
      !options.allowedFileTypes.includes(fileType)
    ) {
      return false;
    }

    try {
      const { uploadUrl, viewUrl, fileStorageObjectId } =
        await createFileUpload({
          fileName: file.name,
          fileType: fileType,
        });

      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          "x-amz-acl": "public-read",
        },
      });
      if (res.status === 200) {
        return { viewUrl, fileStorageObjectId };
      }
    } catch (e) {
      console.error(e);
    }

    return false;
  };
}
