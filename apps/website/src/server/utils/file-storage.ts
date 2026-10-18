import {
  DeleteObjectCommand,
  type ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from "@paralleldrive/cuid2";
import { DateTime } from "luxon";

import {
  type FileStorageObject,
  type ImageMetadata,
  prisma,
} from "@alveusgg/database";

import { env } from "@/env";

import { probeImageMeta } from "@/server/utils/probe-image-meta";

export function getBucketUrl() {
  const endpointUrl = new URL(env.FILE_STORAGE_ENDPOINT);
  if (env.FILE_STORAGE_PATH_STYLE)
    endpointUrl.pathname = `/${env.FILE_STORAGE_BUCKET}/`;
  else
    endpointUrl.hostname = `${env.FILE_STORAGE_BUCKET}.${endpointUrl.hostname}`;
  return endpointUrl.toString();
}

let __client: S3Client;

function getS3Client() {
  if (!__client) {
    if (env.FILE_STORAGE_ENDPOINT === "")
      throw new Error("File storage: FILE_STORAGE_ENDPOINT is not set");
    if (env.FILE_STORAGE_KEY === "")
      throw new Error("File storage: FILE_STORAGE_KEY is not set");
    if (env.FILE_STORAGE_SECRET === "")
      throw new Error("File storage: FILE_STORAGE_SECRET is not set");

    __client = new S3Client({
      forcePathStyle: env.FILE_STORAGE_PATH_STYLE,
      endpoint: env.FILE_STORAGE_ENDPOINT,
      region: env.FILE_STORAGE_REGION,
      credentials: {
        accessKeyId: env.FILE_STORAGE_KEY,
        secretAccessKey: env.FILE_STORAGE_SECRET,
      },
    });
  }

  return __client;
}

export function getViewUrlForFileStorageObjectKey(key: string) {
  return new URL(key, env.FILE_STORAGE_CDN_URL || getBucketUrl());
}

async function sendDeleteObjectCommand(key: string) {
  try {
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: env.FILE_STORAGE_BUCKET, Key: key }),
    );
    return true;
  } catch (err) {
    console.error("Failed to delete file storage object", key, err);
    return false;
  }
}

export async function deleteFileStorageObject(id: string) {
  const data = await prisma.fileStorageObject.findUniqueOrThrow({
    where: { id },
  });

  const deleted = await sendDeleteObjectCommand(data.key);
  if (!deleted) throw new Error("Failed to delete file storage object");

  await prisma.fileStorageObject.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function createFileStorageUpload({
  fileName,
  fileType,
  prefix = "",
  acl = "public-read",
  expires = 3600,
}: {
  fileName: string;
  fileType: string;
  acl?: ObjectCannedACL;
  prefix?: string;
  expires?: number;
}) {
  const normalizedFileName = fileName.replaceAll(" ", "_");
  const id = createId();
  const key = `${prefix}${id}-${encodeURIComponent(normalizedFileName)}`;
  const command = new PutObjectCommand({
    Key: key,
    Bucket: env.FILE_STORAGE_BUCKET,
    ContentType: fileType,
    ACL: acl,
    Metadata: {
      acl,
    },
  });

  const signedUrlString = await getSignedUrl(getS3Client(), command, {
    expiresIn: expires,
    signableHeaders: new Set(["content-type", "x-amz-acl"]),
    unhoistableHeaders: new Set(["x-amz-acl"]),
  });

  const fileStorageObject = await prisma.fileStorageObject.create({
    data: {
      type: fileType,
      name: normalizedFileName,
      key: key,
      acl: acl,
      prefix: prefix,
      expiresAt: DateTime.now().plus({ seconds: expires }).toJSDate(),
    },
  });

  return {
    uploadUrl: new URL(signedUrlString),
    viewUrl: getViewUrlForFileStorageObjectKey(key),
    fileStorageObject,
  };
}

type FileStorageObjectWithImageMetadata = FileStorageObject & {
  imageMetadata: ImageMetadata | null;
};

export type CheckedUploadedImage = {
  fileStorageObject: FileStorageObjectWithImageMetadata;
  metaData: Exclude<Awaited<ReturnType<typeof probeImageMeta>>, false>;
};

// Check an upload before using it. This doesn't mark it as uploaded, so it can
// run before the transaction that uses it. The only write is deleting an upload
// that isn't a valid image.
export async function checkUploadedImage(
  fileStorageObject: FileStorageObjectWithImageMetadata,
) {
  if (
    fileStorageObject.deletedAt !== null ||
    (fileStorageObject.expiresAt && fileStorageObject.expiresAt < new Date())
  ) {
    return { error: "Upload has expired" };
  }

  const url = String(getViewUrlForFileStorageObjectKey(fileStorageObject.key));
  const metaData = await probeImageMeta(url);

  if (!metaData || metaData.mimeType !== fileStorageObject.type) {
    await deleteFileStorageObject(fileStorageObject.id);
    return { error: "Invalid image" };
  }

  return { fileStorageObject, metaData };
}

// Returns the queries without running them, so they can be part of a transaction
export function markImageFileStorageObjectUploaded({
  fileStorageObject,
  metaData,
}: CheckedUploadedImage) {
  return [
    prisma.fileStorageObject.update({
      where: { id: fileStorageObject.id },
      data: {
        uploadedAt: new Date(),
        expiresAt: null,
      },
    }),
    ...(fileStorageObject.imageMetadata
      ? []
      : [
          prisma.imageMetadata.create({
            data: {
              fileStorageObjectId: fileStorageObject.id,
              mimeType: metaData.mimeType,
              width: metaData.width,
              height: metaData.height,
            },
          }),
        ]),
  ];
}

export async function checkAndFixUploadedImageFileStorageObject(id: string) {
  const data = await prisma.fileStorageObject.findUniqueOrThrow({
    where: { id },
    include: { imageMetadata: true },
  });

  const image = await checkUploadedImage(data);
  if (image.error !== undefined) {
    return { error: image.error };
  }

  await Promise.allSettled(markImageFileStorageObjectUploaded(image));

  return { success: true, metaData: image.metaData };
}
