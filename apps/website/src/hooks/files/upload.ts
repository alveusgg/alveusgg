type FileSignature<AllowedFileType extends string = string> = {
  fileName: string;
  fileType: AllowedFileType;
};
type SignedUploadInfo = {
  fileStorageObjectId: string;
  uploadUrl: string;
  viewUrl: string;
};

type CreateFileUpload<AllowedFileType extends string = string> = (
  signature: FileSignature<AllowedFileType>,
) => Promise<SignedUploadInfo>;

const useFileUpload = <AllowedFileType extends string = string>(
  createFileUpload: CreateFileUpload<AllowedFileType>,
  options: { allowedFileTypes?: Readonly<AllowedFileType[]> } = {},
) => {
  const isAllowedFileType = (fileType: string): fileType is AllowedFileType =>
    options.allowedFileTypes
      ? options.allowedFileTypes.includes(fileType as AllowedFileType)
      : true;

  return async (file: File) => {
    const fileType = file.type;
    if (!isAllowedFileType(fileType)) {
      return false;
    }

    try {
      const { uploadUrl, viewUrl, fileStorageObjectId } =
        await createFileUpload({
          fileName: file.name,
          fileType,
        });

      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": fileType,
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
};

export default useFileUpload;
