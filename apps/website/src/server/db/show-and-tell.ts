import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { parseVideoUrl, validateNormalizedVideoUrl } from "@/utils/video-urls";
import { sanitizeUserHtml } from "@/server/utils/sanitize-user-html";
import { prisma } from "@/server/db/client";
import { checkAndFixUploadedImageFileStorageObject } from "@/server/utils/file-storage";
import { getEntityStatus } from "@/utils/entity-helpers";
import { notEmpty } from "@/utils/helpers";

const MAX_IMAGES = 12;

export const withAttachments = {
  include: {
    attachments: {
      include: {
        linkAttachment: true,
        imageAttachment: {
          include: { fileStorageObject: { include: { imageMetadata: true } } },
        },
      },
    },
  },
};

export const whereApproved = {
  approvedAt: { gte: prisma.showAndTellEntry.fields.updatedAt },
};

const attachmentSchema = z.object({
  url: z.string().url(),
  title: z.string().max(100),
  caption: z.string().max(100),
  description: z.string().max(100),
  alternativeText: z.string().max(300),
});

type CreateImageAttachment = z.infer<typeof createImageAttachmentSchema>;
const createImageAttachmentSchema = attachmentSchema.and(
  z.object({
    fileStorageObjectId: z.string().cuid(),
    name: z.string(),
  })
);

type VideoLink = z.infer<typeof videoLinkSchema>;
const videoLinkSchema = z.string().url().refine(validateNormalizedVideoUrl);
const videoLinksSchema = z.array(videoLinkSchema);

const imageAttachmentsSchema = z
  .object({
    create: z.array(createImageAttachmentSchema).max(12),
    update: z.record(z.string().cuid(), attachmentSchema),
  })
  .refine(
    ({ update, create }) =>
      Object.keys(update).length + create.length <= MAX_IMAGES,
    {
      message: `Too many image attachments. Max ${MAX_IMAGES}.`,
    }
  );

export type ShowAndTellSubmitInput = z.infer<
  typeof showAndTellSharedInputSchema
>;
const showAndTellSharedInputSchema = z.object({
  displayName: z.string().max(100),
  title: z.string().max(100),
  text: z.string().max(1_000),
  imageAttachments: imageAttachmentsSchema,
  videoLinks: videoLinksSchema,
});

export const showAndTellCreateInputSchema = showAndTellSharedInputSchema;

export type ShowAndTellUpdateInput = z.infer<
  typeof showAndTellUpdateInputSchema
>;
export const showAndTellUpdateInputSchema = showAndTellSharedInputSchema.and(
  z.object({
    id: z.string().cuid(),
  })
);

const createLinkAttachmentForVideoUrl = (videoUrl: string, idx: number) => ({
  attachmentType: "video",
  linkAttachment: {
    create: {
      type: parseVideoUrl(videoUrl)?.platform || "video",
      url: videoUrl,
      title: `Video ${idx + 1}`,
      name: `Video ${idx + 1}`,
      caption: "",
      alternativeText: "",
      description: "",
    },
  },
});

async function createImageAttachment(attachment: CreateImageAttachment) {
  const { error } = await checkAndFixUploadedImageFileStorageObject(
    attachment.fileStorageObjectId
  );

  if (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Error uploading file: ${error}`,
    });
  }

  const imageAttachment = await prisma.imageAttachment.create({
    data: attachment,
  });

  return {
    attachmentType: "image",
    imageAttachment: { connect: { id: imageAttachment.id } },
  };
}

async function createImageAttachments(
  attachmentsToCreate: Array<CreateImageAttachment>
) {
  // Check and fix new uploaded image attachments
  return await Promise.all(attachmentsToCreate.map(createImageAttachment));
}

function createVideoAttachments(videoLinks: Array<VideoLink>) {
  return videoLinks.map((videoUrl, idx) =>
    createLinkAttachmentForVideoUrl(videoUrl, idx)
  );
}

export async function createPost(
  input: ShowAndTellSubmitInput,
  authorUserId?: string,
  importAt?: Date
) {
  const text = sanitizeUserHtml(input.text);
  const newImages = await createImageAttachments(input.imageAttachments.create);
  const newVideos = createVideoAttachments(input.videoLinks);

  // TODO: Webhook? Notify mods?
  return await prisma.showAndTellEntry.create({
    data: {
      ...(importAt
        ? {
            createdAt: importAt,
            updatedAt: importAt,
            approvedAt: importAt,
          }
        : {}),
      user: authorUserId ? { connect: { id: authorUserId } } : undefined,
      displayName: input.displayName,
      title: input.title,
      text,
      attachments: { create: [...newImages, ...newVideos] },
    },
  });
}

export async function getPostById(id: string, authorUserId?: string) {
  return prisma.showAndTellEntry.findFirst({
    include: {
      ...withAttachments.include,
      user: true,
    },
    where: {
      userId: authorUserId,
      id,
    },
  });
}

export async function updatePost(
  input: ShowAndTellUpdateInput,
  authorUserId?: string,
  keepApproved?: boolean
) {
  // check that the user is the owner of the entry
  // and that the entry has not been deleted
  const existingEntry = await prisma.showAndTellEntry.findFirstOrThrow({
    where: {
      id: input.id,
      userId: authorUserId,
    },
    include: { attachments: true },
  });

  // Check that the only existing image attachments that are connected to the entry are updated
  for (const id of Object.keys(input.imageAttachments.update)) {
    if (!existingEntry.attachments.find((a) => a.imageAttachmentId === id)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Tried to update attachment that is not connected to the entry.`,
      });
    }
  }

  const text = sanitizeUserHtml(input.text);
  const newImages = await createImageAttachments(input.imageAttachments.create);
  const newVideos = createVideoAttachments(input.videoLinks);

  const now = new Date();
  const wasApproved = getEntityStatus(existingEntry) === "approved";

  // TODO: Webhook? Notify mods?
  return await Promise.allSettled([
    prisma.showAndTellEntry.update({
      where: {
        id: input.id,
      },
      data: {
        displayName: input.displayName,
        title: input.title,
        text,
        updatedAt: now,
        approvedAt:
          keepApproved && wasApproved ? now : existingEntry.approvedAt,
        attachments: {
          deleteMany: {
            OR: [
              // Delete all video attachments (we add them back later if they are still in the input)
              { attachmentType: "video", linkAttachmentId: { not: null } },
              // Delete image attachments that are no longer in the update list
              {
                attachmentType: "image",
                imageAttachmentId: {
                  notIn: Object.keys(input.imageAttachments.update),
                },
              },
            ],
          },
          // Create attachments that are in the creation list
          create: [...newImages, ...newVideos],
        },
      },
    }),
    // Update image attachments that are in the update list
    ...Object.entries(input.imageAttachments.update).map(([id, attachment]) =>
      prisma.imageAttachment.update({
        where: { id },
        data: attachment,
      })
    ),
  ]);
}

export async function approvePost(id: string, authorUserId?: string) {
  return await prisma.showAndTellEntry.updateMany({
    where: { id, user: authorUserId ? { id: authorUserId } : undefined },
    data: {
      approvedAt: new Date(),
    },
  });
}

export async function removeApprovalFromPost(
  id: string,
  authorUserId?: string
) {
  return await prisma.showAndTellEntry.updateMany({
    where: { id, user: authorUserId ? { id: authorUserId } : undefined },
    data: {
      approvedAt: null,
    },
  });
}

export async function deletePost(id: string, authorUserId?: string) {
  const post = await getPostById(id, authorUserId);
  if (!post) return false;

  return await Promise.allSettled([
    prisma.showAndTellEntry.delete({ where: { id: post.id } }),
    prisma.imageAttachment.deleteMany({
      where: {
        id: {
          in: post.attachments.map((a) => a.imageAttachmentId).filter(notEmpty),
        },
      },
    }),
    prisma.linkAttachment.deleteMany({
      where: {
        id: {
          in: post.attachments.map((a) => a.linkAttachmentId).filter(notEmpty),
        },
      },
    }),
  ]);
}
