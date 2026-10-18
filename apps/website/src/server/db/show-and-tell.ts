import { TRPCError } from "@trpc/server";
import type { NextApiResponse } from "next";
import { z } from "zod";

import {
  type FileStorageObject,
  type ImageAttachment,
  type ImageMetadata,
  type LinkAttachment,
  Prisma,
  type ShowAndTellEntry$attachmentsArgs,
  type ShowAndTellEntryAttachment,
  type ShowAndTellEntryAttachmentCreateWithoutEntryInput,
  type ShowAndTellEntry as ShowAndTellEntryModel,
  prisma,
} from "@alveusgg/database";

import {
  type CheckedUploadedImage,
  checkUploadedImage,
  markImageFileStorageObjectUploaded,
} from "@/server/utils/file-storage";
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

export const uploadPrefix = "show-and-tell/";

export type ImageAttachmentWithFileStorageObject = ImageAttachment & {
  fileStorageObject:
    (FileStorageObject & { imageMetadata: ImageMetadata | null }) | null;
};

export type FullShowAndTellEntryAttachment = ShowAndTellEntryAttachment & {
  linkAttachment: LinkAttachment | null;
  imageAttachment: ImageAttachmentWithFileStorageObject | null;
};

export type ShowAndTellEntryAttachments = Array<FullShowAndTellEntryAttachment>;

const PublicShowAndTellFields = [
  "id",
  "displayName",
  "pronouns",
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
      orderBy: [{ order: "asc" }, { attachmentType: "desc" }, { id: "asc" }],
    },
  },
} as const satisfies {
  include: { attachments: ShowAndTellEntry$attachmentsArgs };
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

const imageBaseSchema = z.object({
  type: z.literal("image"),
  title: z.string().max(100),
  caption: z.string().max(200),
  description: z.string().max(200),
  alternativeText: z.string().max(300),
});

const imageNewSchema = imageBaseSchema.extend({
  fileStorageObjectId: z.cuid(),
  name: z.string(),
});

const imageExistingSchema = imageBaseSchema.extend({
  id: z.cuid(),
});

const videoSchema = z.object({
  type: z.literal("video"),
  url: z.url().refine(validateNormalizedVideoUrl),
});

const attachmentSchema = z.union([
  imageNewSchema,
  imageExistingSchema,
  videoSchema,
]);

type AttachmentInput = z.infer<typeof attachmentSchema>;
type NewImageInput = z.infer<typeof imageNewSchema>;
type ExistingImageInput = z.infer<typeof imageExistingSchema>;

const isNewImage = (attachment: AttachmentInput): attachment is NewImageInput =>
  attachment.type === "image" && !("id" in attachment);

const isExistingImage = (
  attachment: AttachmentInput,
): attachment is ExistingImageInput =>
  attachment.type === "image" && "id" in attachment;

const attachmentsSchema = z
  .array(attachmentSchema)
  .refine(
    (list) => list.filter((a) => a.type === "image").length <= MAX_IMAGES,
    {
      message: `Too many image attachments. Max ${MAX_IMAGES}.`,
    },
  )
  .refine(
    (list) => list.filter((a) => a.type === "video").length <= MAX_VIDEOS,
    {
      message: `Too many video attachments. Max ${MAX_VIDEOS}.`,
    },
  );

export type ShowAndTellSubmitInput = z.infer<
  typeof showAndTellSharedInputSchema
>;
const showAndTellSharedInputSchema = z.object({
  displayName: z.string().max(100),
  title: z.string().max(100),
  text: z.string().max(MAX_TEXT_HTML_LENGTH),
  attachments: attachmentsSchema,
  volunteeringMinutes: z.number().int().positive().nullable(),
  location: z.string().max(MYSQL_MAX_VARCHAR_LENGTH).nullable(),
  longitude: z.number().nullable(),
  latitude: z.number().nullable(),
  dominantColor: z
    .string()
    .regex(/^\d{1,3},\d{1,3},\d{1,3}$/)
    .refine((val) => val.split(",").every((num) => Number(num) < 256))
    .nullable(),
  pronouns: z
    .string()
    .trim()
    .max(25)
    .nullable()
    .transform((val) => (val === "" ? null : val)),
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

function createVideoAttachment({
  type: _,
  ...attachment
}: z.infer<typeof videoSchema>) {
  return {
    attachmentType: "video",
    linkAttachment: {
      create: {
        type: parseVideoUrl(attachment.url)?.platform || "video",
        url: attachment.url,
        title: "Video",
        name: "Video",
        caption: "",
        alternativeText: "",
        description: "",
      },
    },
  } as const satisfies ShowAndTellEntryAttachmentCreateWithoutEntryInput;
}

const uploadError = (message: string, cause?: unknown) =>
  new TRPCError({
    code: "BAD_REQUEST",
    message: `Error uploading file: ${message}`,
    cause,
  });

const uploadInUseMessage = "Image is already in use, please upload it again";

// Check all new images before anything is saved, so a rejected image can't
// leave the other images of the submission behind
async function checkNewImageUploads(attachments: AttachmentInput[]) {
  const ids = attachments
    .filter(isNewImage)
    .map(({ fileStorageObjectId }) => fileStorageObjectId);
  if (new Set(ids).size !== ids.length) {
    throw uploadError("The same image was added more than once");
  }

  const uploads = ids.length
    ? await prisma.fileStorageObject.findMany({
        where: { id: { in: ids }, prefix: uploadPrefix },
        include: {
          imageMetadata: true,
          imageAttachment: { select: { id: true } },
        },
      })
    : [];
  if (uploads.length !== ids.length) {
    throw uploadError("Upload not found");
  }
  if (uploads.some((upload) => upload.imageAttachment)) {
    throw uploadError(uploadInUseMessage);
  }

  const images = await Promise.all(
    uploads.map((upload) => checkUploadedImage(upload)),
  );

  return new Map(
    images.map((image) => {
      if (image.error !== undefined) {
        throw uploadError(image.error);
      }

      return [image.fileStorageObject.id, image];
    }),
  );
}

// An upload can still be attached by a concurrent submission after it was
// checked, which fails the transaction
function throwSaveError(err: unknown): never {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    (err.code === "P2002" || err.code === "P2014")
  ) {
    throw uploadError(uploadInUseMessage, err);
  }
  throw err;
}

function createAttachment(
  attachment: AttachmentInput,
  images: Map<string, CheckedUploadedImage>,
) {
  if (attachment.type === "video") {
    return createVideoAttachment(attachment);
  }

  if (!isNewImage(attachment)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Existing image attachments cannot be created.",
    });
  }

  const { type: _, fileStorageObjectId, ...data } = attachment;
  const image = images.get(fileStorageObjectId);
  if (!image) throw new Error("Image upload has not been checked");

  return {
    attachmentType: "image",
    imageAttachment: {
      create: {
        ...data,
        url: image.metaData.url,
        fileStorageObject: { connect: { id: fileStorageObjectId } },
      },
    },
  } as const satisfies ShowAndTellEntryAttachmentCreateWithoutEntryInput;
}

export async function createPost(
  res: NextApiResponse,
  input: ShowAndTellSubmitInput,
  authorUserId?: string,
  importAt?: Date,
) {
  const text = sanitizeUserHtml(input.text);

  if (input.attachments.some(isExistingImage)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Existing image attachments cannot be used when creating a post.",
    });
  }

  const images = await checkNewImageUploads(input.attachments);

  const processedAttachments = input.attachments.map((attachment, order) => ({
    ...createAttachment(attachment, images),
    order,
  }));

  // Prisma queries only run once awaited, so this runs as part of the transaction
  const createEntry = prisma.showAndTellEntry.create({
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
      pronouns: input.pronouns,
      title: input.title,
      text,
      volunteeringMinutes: input.volunteeringMinutes,
      attachments: { create: processedAttachments },
      location: input.location,
      longitude: input.longitude,
      latitude: input.latitude,
      dominantColor: input.dominantColor,
    },
  });

  const [result] = await prisma
    .$transaction([
      createEntry,
      ...[...images.values()].flatMap(markImageFileStorageObjectUploaded),
    ])
    .catch(throwSaveError);
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

export async function getUserPost(authorUserId: string, postId: string) {
  return getUserPosts(authorUserId, postId).then((posts) => posts[0] ?? null);
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
  const existingEntryImageAttachmentIds = new Set(
    existingEntry.attachments
      .map((att) => att.imageAttachmentId)
      .filter((id) => id !== null),
  );

  // Existing images are kept and updated, all other attachments are (re-)created
  const existingImages = input.attachments.flatMap((attachment, order) =>
    isExistingImage(attachment) ? [{ attachment, order }] : [],
  );

  // Check that the only existing image attachments that are connected to the entry are updated
  if (
    existingImages.some(
      ({ attachment }) => !existingEntryImageAttachmentIds.has(attachment.id),
    )
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Tried to update attachment that is not connected to the entry.",
    });
  }

  const images = await checkNewImageUploads(input.attachments);

  const newAttachments = input.attachments.flatMap((attachment, order) =>
    isExistingImage(attachment)
      ? []
      : [{ ...createAttachment(attachment, images), order }],
  );

  const text = sanitizeUserHtml(input.text);
  const notePrivate =
    "notePrivate" in input
      ? sanitizeUserHtml(input.notePrivate || "")
      : undefined;
  const notePublic =
    "notePublic" in input
      ? sanitizeUserHtml(input.notePublic || "")
      : undefined;

  const now = new Date();
  const wasApproved = getEntityStatus(existingEntry) === "approved";

  // TODO: Webhook? Notify mods?
  const updateEntry = prisma.showAndTellEntry.update({
    where: {
      id: input.id,
    },
    data: {
      displayName: input.displayName,
      pronouns: input.pronouns,
      title: input.title,
      text,
      volunteeringMinutes: input.volunteeringMinutes,
      updatedAt: now,
      approvedAt: keepApproved && wasApproved ? now : existingEntry.approvedAt,
      attachments: {
        deleteMany: {
          OR: [
            // Delete all video attachments (we add them back later if they are still in the input)
            { attachmentType: { not: "image" } },
            // Delete image attachments that are no longer in the update list
            {
              attachmentType: "image",
              imageAttachmentId: {
                notIn: existingImages.map(({ attachment }) => attachment.id),
              },
            },
          ],
        },
        // Create any new attachments (all videos and new images)
        create: newAttachments,
        // Ensure existing images have the correct order applied
        updateMany: existingImages.map(({ attachment, order }) => ({
          where: { imageAttachmentId: attachment.id },
          data: { order },
        })),
      },
      location: input.location,
      longitude: input.longitude,
      latitude: input.latitude,
      notePrivate,
      notePublic,
      dominantColor: input.dominantColor,
    },
  });

  await prisma
    .$transaction([
      ...existingImages.map(({ attachment: { type: _, id, ...data } }) =>
        prisma.imageAttachment.update({ where: { id }, data }),
      ),
      updateEntry,
      ...[...images.values()].flatMap(markImageFileStorageObjectUploaded),
    ])
    .catch(throwSaveError);
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
