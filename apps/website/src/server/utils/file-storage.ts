import {
  DeleteObjectCommand,
  GetObjectCommand,
  type ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from "@paralleldrive/cuid2";
import { DateTime } from "luxon";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { probeImageMeta } from "@/server/utils/probe-image-meta";

import { imageMimeTypes, maxImageUploadSize } from "@/utils/files";

export const imageUploadInputSchema = z.object({
  // Becomes part of the storage key, which S3 limits to 1024 bytes
  fileName: z.string().max(255),
  fileType: z.literal(imageMimeTypes),
  fileSize: z.number().int().positive().max(maxImageUploadSize),
});

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

// Returns null if the object is missing, empty or larger than maxSize
async function getFileStorageObjectContent(key: string, maxSize: number) {
  try {
    // Request one byte more than allowed to detect larger objects without
    // reading them completely
    const res = await getS3Client().send(
      new GetObjectCommand({
        Bucket: env.FILE_STORAGE_BUCKET,
        Key: key,
        Range: `bytes=0-${maxSize}`,
      }),
    );
    const content = await res.Body?.transformToByteArray();
    if (!content?.length || content.length > maxSize) return null;
    return content;
  } catch (err) {
    console.error("Failed to get file storage object", key, err);
    return null;
  }
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
  fileSize,
  prefix = "",
  acl = "public-read",
  expires = 3600,
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
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
    // Signed, so the upload has to be exactly the requested size
    ContentLength: fileSize,
    ACL: acl,
    Metadata: {
      acl,
    },
  });

  const signedUrlString = await getSignedUrl(getS3Client(), command, {
    expiresIn: expires,
    signableHeaders: new Set(["content-type", "content-length", "x-amz-acl"]),
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

export async function checkAndFixUploadedImageFileStorageObject(id: string) {
  const data = await prisma.fileStorageObject.findUniqueOrThrow({
    where: { id },
    include: { imageMetadata: true },
  });
  if (
    data.deletedAt !== null ||
    (data.expiresAt && data.expiresAt < new Date())
  ) {
    return { error: "Upload has expired" };
  }

  const content = await getFileStorageObjectContent(
    data.key,
    maxImageUploadSize,
  );
  const image = content && probeImageMeta(content);

  if (!image || image.mimeType !== data.type) {
    await deleteFileStorageObject(data.id);
    return { error: "Invalid image" };
  }

  const metaData = {
    ...image,
    url: String(getViewUrlForFileStorageObjectKey(data.key)),
  };

  const tasks = [];
  tasks.push(
    prisma.fileStorageObject.update({
      where: { id },
      data: {
        uploadedAt: new Date(),
        expiresAt: null,
      },
    }),
  );

  if (!data.imageMetadata) {
    tasks.push(
      prisma.imageMetadata.create({
        data: {
          fileStorageObjectId: id,
          mimeType: metaData.mimeType,
          width: metaData.width,
          height: metaData.height,
        },
      }),
    );
  }

  await Promise.allSettled(tasks);

  return { success: true, metaData };
}
