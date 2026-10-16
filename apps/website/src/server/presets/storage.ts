import { createHash } from "node:crypto";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { sync as probeImage } from "probe-image-size";

import { env } from "@/env";

import { getFileStorageClient } from "@/server/utils/file-storage";

import { type CaptureMetadata, MAX_CAPTURE_BYTES } from "./schema";

export async function verifyCaptureUpload(
  key: string,
  capture: CaptureMetadata,
) {
  const object = await getFileStorageClient().send(
    new GetObjectCommand({
      Bucket: env.FILE_STORAGE_BUCKET,
      Key: key,
    }),
  );
  if (
    object.ContentLength !== capture.size ||
    object.ContentType !== capture.contentType ||
    !object.Body
  )
    throw new Error("Capture upload metadata does not match");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of object.Body as AsyncIterable<Uint8Array>) {
    size += chunk.length;
    if (size > MAX_CAPTURE_BYTES || size > capture.size)
      throw new Error("Capture exceeds its declared size");
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);
  if (
    size !== capture.size ||
    createHash("sha256").update(bytes).digest("hex") !== capture.sha256
  )
    throw new Error("Capture upload checksum does not match");
  const image = probeImage(bytes);
  if (
    !image ||
    image.mime !== capture.contentType ||
    image.width < 1 ||
    image.height < 1 ||
    image.width > 16384 ||
    image.height > 16384
  )
    throw new Error("Invalid capture image");
  return { width: image.width, height: image.height, mimeType: image.mime };
}
