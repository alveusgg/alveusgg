import React, { useCallback, useId, useReducer, useRef, useState } from "react";
import { ArrowUpOnSquareStackIcon } from "@heroicons/react/20/solid";
import { fileToBase64 } from "@/utils/files";
import { Button, defaultButtonClasses } from "../Button";
import { MessageBox } from "../MessageBox";
import { useFileDragAndDrop } from "../hooks/useFileDragAndDrop";

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
} & BaseFileReference;

type UploadFileReference = {
  dataURL: string;
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
  key: React.Key;
  fileReference: FileReference;
  removeFileReference: (id: string) => void;
};

type FileUploadingPropsType = {
  files: FileReference[];
  dispatch: React.Dispatch<FileAction>;
  upload: (
    file: File
  ) => Promise<{ viewUrl: string; fileStorageObjectId: string } | false>;
  label?: string;
  allowedFileTypes?: readonly string[];
  multiple?: boolean;
  maxNumber?: number;
  maxFileSize?: number;
  renderAttachment: (props: FileUploadRenderProps) => JSX.Element;
};

type FileAction =
  | { type: "add"; files: FileReference[] }
  | { type: "remove"; id: string }
  | {
      type: "upload.done";
      id: string;
      url: string;
      fileStorageObjectId: string;
    }
  | { type: "upload.failed"; id: string; error?: string };

function fileReducer(
  state: FileReference[],
  action: FileAction
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
          : file
      );
    case "upload.failed":
      return state.map((file) =>
        file.status === "upload.pending" && file.id === action.id
          ? {
              ...file,
              status: "upload.failed",
              error: action.error,
            }
          : file
      );
    default:
      return state;
  }
}

let fileCounter = 0;

export const useUploadAttachmentsData = (
  initialFiles: FileReference[] = []
) => {
  const [fileReferences, dispatch] = useReducer(fileReducer, initialFiles);
  return { files: fileReferences, dispatch };
};

export const UploadAttachmentsField = ({
  files,
  dispatch,
  upload,
  label = "Attachments",
  multiple = true,
  maxNumber = 12,
  maxFileSize,
  allowedFileTypes,
  renderAttachment,
}: FileUploadingPropsType) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileUpload = useCallback((): void => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, [inputRef]);

  const onFileRemove = useCallback(
    (id: string): void => {
      dispatch({ type: "remove", id });
    },
    [dispatch]
  );

  const addFiles = async (filesToAdd: FileList | null) => {
    if (!filesToAdd) return;

    const totalNumber = files.length + filesToAdd.length;
    if (totalNumber > maxNumber) {
      setError(`Max number of files exceeded (${maxNumber})`);
      return;
    }

    const newFiles: Array<Promise<PendingUploadFileReference>> = [];
    for (let i = 0; i < filesToAdd.length; i += 1) {
      const file = filesToAdd[i];
      if (!file) continue;

      if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
        setError(`File type not allowed (${file.type})`);
        return;
      }

      if (maxFileSize && file.size > maxFileSize) {
        setError(`File size too large (${file.size} > ${maxFileSize})`);
        return;
      }

      newFiles.push(
        new Promise(async (resolve) => {
          const dataURL = await fileToBase64(file);
          resolve({
            id: `upload-${fileCounter++}`,
            status: "upload.pending",
            dataURL,
            file,
          });
        })
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
    e: React.ChangeEvent<HTMLInputElement>
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
        <span className="text-sm text-gray-600">
          {files.length} / {maxNumber}
        </span>
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
        {files.length > 0 && (
          <div className="my-3 flex flex-col gap-3">
            {files.map((file) =>
              renderAttachment({
                key: file.id,
                fileReference: file,
                removeFileReference: onFileRemove,
              })
            )}
          </div>
        )}
        <Button
          type="button"
          className={isDragging ? "bg-red-300" : defaultButtonClasses}
          onClick={onFileUpload}
          {...dragProps}
        >
          <ArrowUpOnSquareStackIcon className="h-5 w-5" />
          Click or Drop here
        </Button>
      </div>
    </div>
  );
};
