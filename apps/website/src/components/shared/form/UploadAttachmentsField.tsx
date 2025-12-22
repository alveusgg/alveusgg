import {
  type ChangeEvent,
  type Dispatch,
  type Key,
  type ReactNode,
  useCallback,
  useId,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  fileToBase64,
  getFileEndingForImageMimeType,
  getImageMimeType,
  isImageMimeType,
} from "@/utils/files";
import { imageConverter } from "@/utils/image-converter";
import {
  type ResizeImageOptions,
  extractColorFromImage,
  resizeImage,
} from "@/utils/process-image";

import useFileDragAndDrop from "@/hooks/files/drop";

import IconLoading from "@/icons/IconLoading";
import IconUploadFiles from "@/icons/IconUploadFiles";

import { MessageBox } from "../MessageBox";
import { ModalDialog } from "../ModalDialog";
import { Button, defaultButtonClasses } from "./Button";

export type FileReference =
  | InitialFileReference
  | SavedFileReference
  | PendingUploadFileReference
  | UploadedUploadFileReference
  | FailedUploadFileReference;

type BaseFileReference = {
  id: string;
};

type InitialFileReference = {
  status: "initial";
} & BaseFileReference;

export type SavedFileReference = {
  status: "saved";
  url: string;
  fileStorageObjectId: string;
  extractColor: () => Promise<string>;
} & BaseFileReference;

type UploadFileReference = {
  dataURL: string;
  extractColor: () => string | Promise<string>;
  file: File;
} & BaseFileReference;

type PendingUploadFileReference = {
  status: "upload.pending";
} & UploadFileReference;

type UploadedUploadFileReference = {
  status: "upload.done";
  url: string;
  fileStorageObjectId: string;
} & UploadFileReference;

type FailedUploadFileReference = {
  status: "upload.failed";
  error?: string;
} & UploadFileReference;

export type FileUploadRenderProps = {
  key: Key;
  fileReference: FileReference;
  removeFileReference: (id: string) => void;
};

type FileUploadingPropsType = {
  files: FileReference[];
  dispatch: Dispatch<FileAction>;
  upload: (
    file: File,
  ) => Promise<{ viewUrl: string; fileStorageObjectId: string } | false>;
  label?: string;
  allowedFileTypes?: readonly string[];
  multiple?: boolean;
  maxNumber?: number;
  maxFileSize?: number;
  renderAttachment?: (props: FileUploadRenderProps) => ReactNode;
  resizeImageOptions?: Omit<ResizeImageOptions, "type">;
  attachmentsClassName?: string;
};

export type FileAction =
  | { type: "add"; files: FileReference[] }
  | { type: "remove"; id: string }
  | {
      type: "upload.done";
      id: string;
      url: string;
      fileStorageObjectId: string;
    }
  | { type: "upload.failed"; id: string; error?: string };

export function fileReducer(
  state: FileReference[],
  action: FileAction,
): FileReference[] {
  switch (action.type) {
    case "add":
      return [...state, ...action.files];
    case "remove":
      return state.filter((file) => file.id !== action.id);
    case "upload.done":
      return state.map((file) =>
        file.status === "upload.pending" && file.id === action.id
          ? {
              ...file,
              status: "upload.done",
              url: action.url,
              fileStorageObjectId: action.fileStorageObjectId,
            }
          : file,
      );
    case "upload.failed":
      return state.map((file) =>
        file.status === "upload.pending" && file.id === action.id
          ? {
              ...file,
              status: "upload.failed",
              error: action.error,
            }
          : file,
      );
    default:
      return state;
  }
}

let fileCounter = 0;

export const useUploadAttachmentsData = (
  initialFiles: FileReference[] = [],
) => {
  const [fileReferences, dispatch] = useReducer(fileReducer, initialFiles);
  return { files: fileReferences, dispatch };
};

async function handleImageResize(
  file: File,
  dataURL: string,
  resizeImageOptions: Omit<ResizeImageOptions, "type">,
) {
  let fileName = file.name;
  let type = getImageMimeType(file.type);
  if (!type) return;

  const resized = await resizeImage(dataURL, {
    ...resizeImageOptions,
    type,
  });
  if (!resized) return;

  // Check if the mime type has changed after resizing because the browser
  // might not support the mime type (notably WebP with Safari as of 2024-05)
  const resizedType = resized.dataURL.match(/^data:(image\/.*?);/)?.[1];
  if (resizedType && resizedType !== type && isImageMimeType(resizedType)) {
    fileName += "." + getFileEndingForImageMimeType(resizedType);
    type = resizedType;
  }

  return {
    dataURL: resized.dataURL,
    extractColor: resized.extractColor,
    fileToUpload: new File([resized.blob], fileName, { type }),
  };
}

export const UploadAttachmentsField = ({
  files,
  dispatch,
  upload,
  label = "Attachments",
  multiple = true,
  maxNumber,
  maxFileSize,
  allowedFileTypes,
  resizeImageOptions,
  renderAttachment,
  attachmentsClassName = "my-3 flex flex-col gap-3",
}: FileUploadingPropsType) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageConversionError, setImageConversionError] = useState<
    string | null
  >(null);
  const [isImageConverting, setIsImageConverting] = useState(false);

  const convertImage = async (file: File) => {
    setIsImageConverting(true);
    try {
      return await imageConverter(file);
    } catch (e) {
      setImageConversionError(`${e}`);
      return;
    } finally {
      setIsImageConverting(false);
    }
  };

  const onFileUpload = useCallback((): void => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, [inputRef]);

  const onFileRemove = useCallback(
    (id: string): void => {
      dispatch({ type: "remove", id });
    },
    [dispatch],
  );

  const addFiles = async (filesToAdd: FileList | null) => {
    if (!filesToAdd) return;

    const totalNumber = files.length + filesToAdd.length;
    if (maxNumber && totalNumber > maxNumber) {
      setError(`Max number of files exceeded (${maxNumber})`);
      return;
    }

    const newFiles: Array<Promise<PendingUploadFileReference>> = [];
    for (let i = 0; i < filesToAdd.length; i += 1) {
      const file = filesToAdd[i];
      if (!file) continue;

      // Run through the image converter to convert the file to a jpeg if it's a heic, avif or heif file
      // returns the original file if conversion not needed
      const fileToUpload = await convertImage(file);

      if (!fileToUpload) continue;

      if (allowedFileTypes && !allowedFileTypes.includes(fileToUpload.type)) {
        setError(`File type not allowed (${fileToUpload.type})`);
        return;
      }

      if (maxFileSize && fileToUpload.size > maxFileSize) {
        setError(`File size too large (${fileToUpload.size} > ${maxFileSize})`);
        return;
      }

      newFiles.push(
        (async () => {
          let dataURL = await fileToBase64(fileToUpload);
          let extractColor: PendingUploadFileReference["extractColor"] =
            async () => await extractColorFromImage(dataURL);
          let readyFile = fileToUpload;

          if (resizeImageOptions) {
            const resized = await handleImageResize(
              readyFile,
              dataURL,
              resizeImageOptions,
            );
            if (resized) {
              readyFile = resized.fileToUpload;
              dataURL = resized.dataURL;
              extractColor = resized.extractColor;
            }
          }

          return {
            id: `upload-${fileCounter++}`,
            status: "upload.pending",
            dataURL,
            extractColor,
            file: readyFile,
          };
        })(),
      );
    }

    if (error) {
      setError(null);
    }

    const pendingFiles = await Promise.all(newFiles);
    if (!newFiles.length) return;

    dispatch({ type: "add", files: pendingFiles });
    pendingFiles.map(async (file) => {
      const done = await upload(file.file);
      if (done) {
        dispatch({
          type: "upload.done",
          id: file.id,
          url: done.viewUrl,
          fileStorageObjectId: done.fileStorageObjectId,
        });
      } else {
        dispatch({ type: "upload.failed", id: file.id });
      }
    });
  };

  const onInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    await addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };
  const { isDragging, dragProps } = useFileDragAndDrop(addFiles);

  const id = `upload-attachment-field-${useId()}`;

  return (
    <div>
      <label htmlFor={id} className="flex flex-row items-end justify-between">
        <span>{label}</span>
        {maxNumber && (
          <span className="text-sm text-gray-600">
            {files.length} / {maxNumber}
          </span>
        )}
      </label>

      {error && (
        <MessageBox className="mb-4" variant="failure">
          {error}
        </MessageBox>
      )}

      <input
        type="file"
        accept={allowedFileTypes ? allowedFileTypes.join(",") : undefined}
        ref={inputRef}
        multiple={multiple}
        onChange={onInputChange}
        className="hidden"
        id={id}
      />
      <div>
        {renderAttachment && files.length > 0 && (
          <div className={attachmentsClassName}>
            {files.map((file) =>
              renderAttachment({
                key: file.id,
                fileReference: file,
                removeFileReference: onFileRemove,
              }),
            )}
          </div>
        )}
        <Button
          type="button"
          className={isDragging ? "bg-red-300" : defaultButtonClasses}
          onClick={onFileUpload}
          {...dragProps}
        >
          <IconUploadFiles className="size-5" />
          Click or Drop here
        </Button>
      </div>

      <ModalDialog
        isOpen={isImageConverting}
        closeModal={() => setIsImageConverting(false)}
        title={
          imageConversionError ? "Image conversion failed" : "Converting image"
        }
      >
        <div className="flex flex-row items-center justify-center gap-2">
          {imageConversionError && (
            <span className="text-red-500">
              Unable to convert image format. Please try another file.
            </span>
          )}
          {!imageConversionError && (
            <>
              <span>Processing image for upload...</span>
              <IconLoading className="size-5 animate-spin" />
            </>
          )}
        </div>
      </ModalDialog>
    </div>
  );
};
