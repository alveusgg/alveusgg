import { TRPCError } from "@trpc/server";
import type { NextApiResponse } from "next";
import { z } from "zod";

import {
  type FileStorageObject,
  type ImageAttachment,
  type ImageMetadata,
  type LinkAttachment,
  type ShowAndTellEntryAttachment,
  type ShowAndTellEntry as ShowAndTellEntryModel,
  prisma,
} from "@alveusgg/database";

import { checkAndFixUploadedImageFileStorageObject } from "@/server/utils/file-storage";
import { sanitizeUserHtml } from "@/server/utils/sanitize-user-html";

import {
  MAX_IMAGES,
  MAX_TEXT_HTML_LENGTH,
  MAX_VIDEOS,
  MYSQL_MAX_VARCHAR_LENGTH,
} from "@/data/show-and-tell";

import { getEntityStatus } from "@/utils/entity-helpers";
import { notEmpty } from "@/utils/helpers";
import { parseVideoUrl, validateNormalizedVideoUrl } from "@/utils/video-urls";

export type ImageAttachmentWithFileStorageObject = ImageAttachment & {
  fileStorageObject:
    | (FileStorageObject & { imageMetadata: ImageMetadata | null })
    | null;
};

export type FullShowAndTellEntryAttachment = ShowAndTellEntryAttachment & {
  linkAttachment: LinkAttachment | null;
  imageAttachment: ImageAttachmentWithFileStorageObject | null;
};

export type ShowAndTellEntryAttachments = Array<FullShowAndTellEntryAttachment>;

const PublicShowAndTellFields = [
  "id",
  "displayName",
  "title",
  "text",
  "createdAt",
  "updatedAt",
  "approvedAt",
  "seenOnStream",
  "volunteeringMinutes",
  "location",
  "notePublic",
  "dominantColor",
] as const satisfies (keyof ShowAndTellEntryModel)[];

export type PublicShowAndTellEntry = Pick<
  ShowAndTellEntryModel,
  (typeof PublicShowAndTellFields)[number]
>;

export type PublicShowAndTellEntryWithAttachments = PublicShowAndTellEntry & {
  attachments: ShowAndTellEntryAttachments;
};

const OwnShowAndTellFields = [
  ...PublicShowAndTellFields,
  "longitude",
  "latitude",
] as const satisfies (keyof ShowAndTellEntryModel)[];

const withAttachments = {
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

const selectPublic = PublicShowAndTellFields.reduce(
  (acc, field) => ({ ...acc, [field]: true }),
  {} as { [K in (typeof PublicShowAndTellFields)[number]]: true },
);

const selectOwn = OwnShowAndTellFields.reduce(
  (acc, field) => ({ ...acc, [field]: true }),
  {} as { [K in (typeof OwnShowAndTellFields)[number]]: true },
);

const whereApproved = {
  approvedAt: { gte: prisma.showAndTellEntry.fields.updatedAt },
};

function getPostFilter(filter: "approved" | "pendingApproval") {
  return filter === "pendingApproval"
    ? {
        OR: [
          { approvedAt: null },
          { approvedAt: { lt: prisma.showAndTellEntry.fields.updatedAt } },
        ],
      }
    : filter === "approved"
      ? { approvedAt: { gte: prisma.showAndTellEntry.fields.updatedAt } }
      : {};
}

const postOrderBy = [
  { seenOnStream: "asc" }, // make sure not yet seen posts are at the top
  { createdAt: "desc" },
] as const;

const attachmentSchema = z.object({
  url: z.url(),
  title: z.string().max(100),
  caption: z.string().max(200),
  description: z.string().max(200),
  alternativeText: z.string().max(300),
});

type CreateImageAttachment = z.infer<typeof createImageAttachmentSchema>;
const createImageAttachmentSchema = attachmentSchema.and(
  z.object({
    fileStorageObjectId: z.cuid(),
    name: z.string(),
  }),
);

type VideoLink = z.infer<typeof videoLinkSchema>;
const videoLinkSchema = z.url().refine(validateNormalizedVideoUrl);
const videoLinksSchema = z.array(videoLinkSchema);

const imageAttachmentsSchema = z
  .object({
    create: z.array(createImageAttachmentSchema).max(MAX_IMAGES),
    update: z.record(z.cuid(), attachmentSchema),
  })
  .refine(
    ({ update, create }) =>
      Object.keys(update).length + create.length <= MAX_IMAGES,
    {
      message: `Too many image attachments. Max ${MAX_IMAGES}.`,
    },
  );

export type ShowAndTellSubmitInput = z.infer<
  typeof showAndTellSharedInputSchema
>;
const showAndTellSharedInputSchema = z.object({
  displayName: z.string().max(100),
  title: z.string().max(100),
  text: z.string().max(MAX_TEXT_HTML_LENGTH),
  imageAttachments: imageAttachmentsSchema,
  videoLinks: videoLinksSchema.max(MAX_VIDEOS),
  volunteeringMinutes: z.number().int().positive().nullable(),
  location: z.string().max(MYSQL_MAX_VARCHAR_LENGTH).nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  dominantColor: z
    .string()
    .regex(/^\d{1,3},\d{1,3},\d{1,3}$/)
    .refine((val) => val.split(",").every((num) => Number(num) < 256))
    .nullable(),
});

export const showAndTellCreateInputSchema = showAndTellSharedInputSchema;

export const showAndTellUpdateInputSchema = showAndTellSharedInputSchema.and(
  z.object({
    id: z.cuid(),
  }),
);

export const showAndTellReviewInputSchema = showAndTellUpdateInputSchema.and(
  z.object({
    notePrivate: z.string().nullable(),
    notePublic: z.string().nullable(),
  }),
);

export type ShowAndTellUpdateInput =
  | z.infer<typeof showAndTellUpdateInputSchema>
  | z.infer<typeof showAndTellReviewInputSchema>;

const revalidateCache = (res: NextApiResponse) => {
  res.revalidate("/show-and-tell");
  res.revalidate("/show-and-tell/map");
};

function createLinkAttachmentForVideoUrl(videoUrl: string, idx: number) {
  return {
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
  };
}

async function createImageAttachment(attachment: CreateImageAttachment) {
  const { error } = await checkAndFixUploadedImageFileStorageObject(
    attachment.fileStorageObjectId,
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
  attachmentsToCreate: Array<CreateImageAttachment>,
) {
  // Check and fix new uploaded image attachments
  return Promise.all(attachmentsToCreate.map(createImageAttachment));
}

function createVideoAttachments(videoLinks: Array<VideoLink>) {
  return videoLinks.map((videoUrl, idx) =>
    createLinkAttachmentForVideoUrl(videoUrl, idx),
  );
}

export async function createPost(
  res: NextApiResponse,
  input: ShowAndTellSubmitInput,
  authorUserId?: string,
  importAt?: Date,
) {
  const text = sanitizeUserHtml(input.text);
  const newImages = await createImageAttachments(input.imageAttachments.create);
  const newVideos = createVideoAttachments(input.videoLinks);

  // TODO: Webhook? Notify mods?
  const result = await prisma.showAndTellEntry.create({
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
      volunteeringMinutes: input.volunteeringMinutes,
      attachments: { create: [...newImages, ...newVideos] },
      location: input.location,
      longitude: input.longitude,
      latitude: input.latitude,
      dominantColor: input.dominantColor,
    },
  });
  revalidateCache(res);
  return result;
}

export async function getPublicPostById(id: string) {
  return prisma.showAndTellEntry.findFirst({
    select: {
      ...selectPublic,
      attachments: withAttachments.include.attachments,
    },
    where: {
      ...whereApproved,
      id,
    },
  });
}

export async function getPublicPosts({
  take,
  cursor,
}: {
  take?: number;
  cursor?: string;
} = {}) {
  return prisma.showAndTellEntry.findMany({
    where: getPostFilter("approved"),
    select: {
      ...selectPublic,
      attachments: withAttachments.include.attachments,
    },
    orderBy: [...postOrderBy],
    cursor: cursor ? { id: cursor } : undefined,
    take,
  });
}

export async function getUserPosts(authorUserId: string, postId?: string) {
  return prisma.showAndTellEntry.findMany({
    select: {
      ...selectOwn,
      attachments: withAttachments.include.attachments,
    },
    where: {
      userId: authorUserId,
      id: postId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPostsCount() {
  return prisma.showAndTellEntry.count({
    where: getPostFilter("approved"),
  });
}

export async function getUsersCount() {
  const [countWithUserId, countWithoutUserId] = await Promise.all([
    prisma.showAndTellEntry.findMany({
      select: { id: true },
      where: {
        userId: {
          not: null,
        },
        AND: getPostFilter("approved"),
      },
      distinct: ["userId"],
    }),
    prisma.showAndTellEntry.findMany({
      select: { id: true },
      where: {
        userId: null,
        AND: getPostFilter("approved"),
      },
      distinct: ["displayName"],
    }),
  ] as const);

  return countWithUserId.length + countWithoutUserId.length;
}

export async function getVolunteeringMinutes({
  start,
  end,
}: { start?: Date; end?: Date } = {}) {
  const res = await prisma.showAndTellEntry.aggregate({
    _sum: { volunteeringMinutes: true },
    where: {
      AND: [
        getPostFilter("approved"),
        start && { createdAt: { gte: start } },
        end && { createdAt: { lt: end } },
      ].filter(notEmpty),
    },
  });

  return res._sum.volunteeringMinutes ?? 0;
}

export async function getAdminPosts({
  take,
  cursor,
  filter = "approved",
}: {
  take?: number;
  cursor?: string;
  filter?: "approved" | "pendingApproval";
} = {}) {
  return prisma.showAndTellEntry.findMany({
    where: getPostFilter(filter),
    orderBy: [...postOrderBy],
    include: { user: true },
    cursor: cursor ? { id: cursor } : undefined,
    take,
  });
}

export async function getAdminPost(id: string, authorUserId?: string) {
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
  res: NextApiResponse,
  input: ShowAndTellUpdateInput,
  authorUserId?: string,
  keepApproved?: boolean,
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
  const notePrivate =
    "notePrivate" in input
      ? sanitizeUserHtml(input.notePrivate || "")
      : undefined;
  const notePublic =
    "notePublic" in input
      ? sanitizeUserHtml(input.notePublic || "")
      : undefined;
  const newImages = await createImageAttachments(input.imageAttachments.create);
  const newVideos = createVideoAttachments(input.videoLinks);

  const now = new Date();
  const wasApproved = getEntityStatus(existingEntry) === "approved";

  // TODO: Webhook? Notify mods?
  await Promise.allSettled([
    prisma.showAndTellEntry.update({
      where: {
        id: input.id,
      },
      data: {
        displayName: input.displayName,
        title: input.title,
        text,
        volunteeringMinutes: input.volunteeringMinutes,
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
        location: input.location,
        longitude: input.longitude,
        latitude: input.latitude,
        notePrivate,
        notePublic,
        dominantColor: input.dominantColor,
      },
    }),
    // Update image attachments that are in the update list
    ...Object.entries(input.imageAttachments.update).map(([id, attachment]) =>
      prisma.imageAttachment.update({
        where: { id },
        data: attachment,
      }),
    ),
  ]);
  revalidateCache(res);
}

export async function approvePost(
  res: NextApiResponse,
  id: string,
  authorUserId?: string,
) {
  await prisma.showAndTellEntry.updateMany({
    where: { id, user: authorUserId ? { id: authorUserId } : undefined },
    data: {
      approvedAt: new Date(),
    },
  });
  revalidateCache(res);
}

export async function removeApprovalFromPost(
  res: NextApiResponse,
  id: string,
  authorUserId?: string,
) {
  await prisma.showAndTellEntry.updateMany({
    where: { id, user: authorUserId ? { id: authorUserId } : undefined },
    data: {
      approvedAt: null,
    },
  });
  revalidateCache(res);
}

export const markPostAsSeenModeSchema = z
  .literal(["this", "thisAndOlder", "thisAndNewer"])
  .default("this");

export type MarkPostAsSeenMode = z.infer<typeof markPostAsSeenModeSchema>;

export async function markPostAsSeen(
  res: NextApiResponse,
  id: string,
  mode: MarkPostAsSeenMode = "this",
) {
  if (mode === "this") {
    await prisma.showAndTellEntry.update({
      where: { id },
      data: {
        seenOnStream: true,
        seenOnStreamAt: new Date(),
      },
    });
    revalidateCache(res);
    return;
  }

  const entry = await prisma.showAndTellEntry.findUniqueOrThrow({
    select: { approvedAt: true, createdAt: true },
    where: { id },
  });
  if (!entry.approvedAt) return;

  const ids = (
    await prisma.showAndTellEntry.findMany({
      select: { id: true },
      where: {
        AND: [
          whereApproved,
          {
            createdAt:
              mode === "thisAndNewer"
                ? { gte: entry.createdAt }
                : { lt: entry.createdAt },
          },
        ],
      },
    })
  ).map((e) => e.id);
  await prisma.showAndTellEntry.updateMany({
    where: { id: { in: [id, ...ids] } },
    data: {
      seenOnStream: true,
      seenOnStreamAt: new Date(),
    },
  });

  revalidateCache(res);
}

export async function unmarkPostAsSeen(res: NextApiResponse, id: string) {
  await prisma.showAndTellEntry.update({
    where: { id },
    data: {
      seenOnStream: false,
      seenOnStreamAt: null,
    },
  });
  revalidateCache(res);
}

export async function deletePost(
  res: NextApiResponse,
  id: string,
  authorUserId?: string,
) {
  const post = await getAdminPost(id, authorUserId);
  if (!post) return false;

  await Promise.allSettled([
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
  revalidateCache(res);
}

export async function getPostsToShow() {
  const postsToShow = await prisma.showAndTellEntry.count({
    where: {
      AND: [whereApproved, { seenOnStream: false }],
    },
  });

  return postsToShow;
}

export type LocationFeature = {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
};

export async function getMapFeatures() {
  return (await prisma.showAndTellEntry.findMany({
    where: {
      ...whereApproved,
      longitude: { not: null },
      latitude: { not: null },
    },
    select: {
      id: true,
      location: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { createdAt: "asc" },
  })) as LocationFeature[];
}
