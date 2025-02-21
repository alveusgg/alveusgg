import type { ReactNode, MouseEvent } from "react";

import { classes } from "@/utils/classes";

import IconLoading from "@/icons/IconLoading";

import { Button } from "@/components/shared/form/Button";
import type { FileReference } from "@/components/shared/form/UploadAttachmentsField";
import IconTrash from "@/icons/IconTrash";
import IconWarningTriangle from "@/icons/IconWarningTriangle";
import IconCheck from "@/icons/IconCheck";

export function ImageUploadFilePreview({
  fileReference,
}: {
  fileReference: FileReference;
}) {
  const src =
    fileReference.status === "saved"
      ? fileReference.url
      : "dataURL" in fileReference
        ? fileReference.dataURL
        : undefined;

  const fadeOutImage =
    fileReference.status === "upload.pending" ||
    fileReference.status === "upload.failed";

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={classes(
          "absolute inset-0 h-full w-full object-contain object-center transition-opacity",
          fadeOutImage && "opacity-50",
        )}
      />
      {fileReference.status === "upload.done" && (
        <div className="absolute inset-0 flex items-end text-black">
          <div className="m-px flex items-center gap-0.5 rounded-lg bg-green px-1 py-0.5 text-xs">
            <IconCheck size={12} />
            Uploaded
          </div>
        </div>
      )}
      {fileReference.status === "upload.pending" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-black">
          <IconLoading size={24} />
          <span>Uploading</span>
        </div>
      )}
      {fileReference.status === "upload.failed" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red/20 text-black">
          <IconWarningTriangle className="size-5" />
          <span>Failed</span>
        </div>
      )}
    </>
  );
}

export function ImageUploadAttachment({
  removeFileReference,
  fileReference,
  children = "",
  showRemoveButton = true,
  onClick,
}: {
  removeFileReference: (id: string) => void;
  fileReference: FileReference;
  children?: ReactNode | ReactNode[];
  showRemoveButton?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const src =
    fileReference.status === "saved" || fileReference.status === "upload.done"
      ? fileReference.url
      : "dataURL" in fileReference
        ? fileReference.dataURL
        : undefined;

  return (
    <div className="flex flex-row gap-5 rounded-lg bg-white p-2 px-4 shadow-lg">
      <div className="py-2">
        <a
          href={src}
          className="relative block size-32 overflow-hidden rounded-lg bg-gray-200"
          title="Click to view image"
          onClick={onClick}
        >
          <ImageUploadFilePreview fileReference={fileReference} />
        </a>

        {showRemoveButton && (
          <div className="p-2">
            <Button
              size="small"
              onClick={() => removeFileReference(fileReference.id)}
            >
              <IconTrash className="size-5" />
              Remove
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
