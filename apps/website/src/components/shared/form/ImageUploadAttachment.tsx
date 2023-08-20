import type { ReactNode } from "react";
import React from "react";

import { classes } from "@/utils/classes";

import IconLoading from "@/icons/IconLoading";

import { Button } from "@/components/shared/Button";
import type { FileReference } from "@/components/shared/form/UploadAttachmentsField";
import IconTrash from "@/icons/IconTrash";
import IconWarningTriangle from "@/icons/IconWarningTriangle";

export function ImageUploadAttachment({
  removeFileReference,
  fileReference,
  children = "",
}: {
  removeFileReference: (id: string) => void;
  fileReference: FileReference;
  children?: ReactNode | ReactNode[];
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
    <div className="flex flex-row gap-5 rounded-lg bg-white p-2 px-4 shadow-lg">
      <div className="py-2">
        <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className={classes(
              "absolute inset-0 h-full w-full object-contain object-center transition-opacity",
              fadeOutImage && "opacity-50",
            )}
          />
          {fileReference.status === "upload.pending" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black">
              <IconLoading size={24} />
              <span>Uploading</span>
            </div>
          )}
          {fileReference.status === "upload.failed" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red/20 text-black">
              <IconWarningTriangle className="h-5 w-5" />
              <span>Failed</span>
            </div>
          )}
        </div>
        <div className="p-2">
          <Button
            size="small"
            onClick={() => removeFileReference(fileReference.id)}
          >
            <IconTrash className="h-5 w-5" />
            Remove
          </Button>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
