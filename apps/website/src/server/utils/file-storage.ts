import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import add from "date-fns/add";

import { env } from "@/env/index.mjs";
import { prisma } from "@/server/db/client";
import { probeImageMeta } from "@/server/utils/probe-image-meta";

function getBucketUrl() {
  const endpointUrl = new URL(env.FILE_STORAGE_ENDPOINT);
  return `https://${env.FILE_STORAGE_BUCKET}.${endpointUrl.hostname}/`;
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
      forcePathStyle: false,
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
  acl?: string;
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
    signableHeaders: new Set(["content-type", "acl"]),
  });

  const fileStorageObject = await prisma.fileStorageObject.create({
    data: {
      type: fileType,
      name: normalizedFileName,
      key: key,
      acl: acl,
      prefix: prefix,
      expiresAt: add(new Date(), { seconds: expires }),
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

  const url = String(getViewUrlForFileStorageObjectKey(data.key));
  const metaData = await probeImageMeta(url);

  if (!metaData || metaData.mimeType !== data.type) {
    await deleteFileStorageObject(data.id);
    return { error: "Invalid image" };
  }

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
