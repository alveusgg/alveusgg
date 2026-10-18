import type { NextApiResponse } from "next";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { createPost, updatePost } from "@/server/db/show-and-tell";

const { mockPrisma, mockProbeImageMeta } = vi.hoisted(() => ({
  mockProbeImageMeta: vi.fn(),
  mockPrisma: {
    $transaction: vi.fn(),
    fileStorageObject: {
      findMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    imageAttachment: { update: vi.fn() },
    imageMetadata: { create: vi.fn() },
    showAndTellEntry: {
      create: vi.fn(),
      update: vi.fn(),
      findFirstOrThrow: vi.fn(),
      fields: { updatedAt: "updatedAt" },
    },
  },
}));

vi.mock("@alveusgg/database", () => ({
  prisma: mockPrisma,
  Prisma: { PrismaClientKnownRequestError: class extends Error {} },
}));

vi.mock("@/env", () => ({
  env: {
    FILE_STORAGE_CDN_URL: "https://cdn.example.com/",
    FILE_STORAGE_ENDPOINT: "https://s3.example.com",
    FILE_STORAGE_BUCKET: "bucket",
    FILE_STORAGE_KEY: "key",
    FILE_STORAGE_SECRET: "secret",
    FILE_STORAGE_REGION: "region",
  },
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = vi.fn().mockResolvedValue({});
  },
  DeleteObjectCommand: class {},
  PutObjectCommand: class {},
}));

vi.mock("@/server/utils/probe-image-meta", () => ({
  probeImageMeta: mockProbeImageMeta,
}));

const res = { revalidate: vi.fn() } as unknown as NextApiResponse;

const upload = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  key: `show-and-tell/${id}-image.png`,
  name: "image.png",
  type: "image/png",
  prefix: "show-and-tell/",
  acl: "public-read",
  createdAt: new Date(),
  uploadedAt: null,
  deletedAt: null,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  imageMetadata: null,
  imageAttachment: null,
  ...overrides,
});

const image = (fileStorageObjectId: string) => ({
  type: "image" as const,
  fileStorageObjectId,
  name: "image.png",
  title: "Title",
  caption: "",
  description: "",
  alternativeText: "Alt",
});

const input = {
  displayName: "Name",
  title: "Title",
  text: "<p>Text</p>",
  volunteeringMinutes: null,
  location: null,
  longitude: null,
  latitude: null,
  dominantColor: null,
  pronouns: null,
};

beforeEach(() => {
  vi.clearAllMocks();

  // Uploads with "rejected" in their key are not valid images
  mockProbeImageMeta.mockImplementation(async (url: string) =>
    url.includes("rejected")
      ? false
      : { width: 100, height: 50, type: "png", mimeType: "image/png", url },
  );

  // Queries are only built by the code under test, and run by $transaction
  mockPrisma.showAndTellEntry.create.mockReturnValue("createEntry");
  mockPrisma.showAndTellEntry.update.mockReturnValue("updateEntry");
  mockPrisma.imageAttachment.update.mockReturnValue("updateImage");
  mockPrisma.fileStorageObject.update.mockReturnValue("markUploaded");
  mockPrisma.imageMetadata.create.mockReturnValue("createMetadata");
  mockPrisma.$transaction.mockImplementation(async (queries: unknown[]) =>
    queries.map((query) => ({ query })),
  );
});

describe("createPost", () => {
  test("saves the entry, its images and their uploads in one transaction", async () => {
    mockPrisma.fileStorageObject.findMany.mockResolvedValue([upload("a")]);

    await createPost(res, { ...input, attachments: [image("a")] });

    expect(mockPrisma.$transaction).toHaveBeenCalledExactlyOnceWith([
      "createEntry",
      "markUploaded",
      "createMetadata",
    ]);
    expect(
      mockPrisma.showAndTellEntry.create.mock.calls[0]?.[0].data.attachments,
    ).toEqual({
      create: [
        {
          attachmentType: "image",
          order: 0,
          imageAttachment: {
            create: {
              name: "image.png",
              title: "Title",
              caption: "",
              description: "",
              alternativeText: "Alt",
              url: "https://cdn.example.com/show-and-tell/a-image.png",
              fileStorageObject: { connect: { id: "a" } },
            },
          },
        },
      ],
    });
    expect(res.revalidate).toHaveBeenCalled();
  });

  test("saves nothing when one of the images is rejected", async () => {
    mockPrisma.fileStorageObject.findMany.mockResolvedValue([
      upload("a"),
      upload("rejected"),
    ]);
    mockPrisma.fileStorageObject.findUniqueOrThrow.mockResolvedValue(
      upload("rejected"),
    );

    await expect(
      createPost(res, {
        ...input,
        attachments: [image("a"), image("rejected")],
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Error uploading file: Invalid image",
    });

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.showAndTellEntry.create).not.toHaveBeenCalled();
    // The invalid upload is deleted, the valid one is left to expire
    expect(mockPrisma.fileStorageObject.update).toHaveBeenCalledExactlyOnceWith(
      { where: { id: "rejected" }, data: { deletedAt: expect.any(Date) } },
    );
    expect(res.revalidate).not.toHaveBeenCalled();
  });

  test.each([
    {
      name: "the same upload twice",
      attachments: [image("a"), image("a")],
      uploads: [upload("a")],
      message: "The same image was added more than once",
    },
    {
      name: "an upload that is already attached",
      attachments: [image("a")],
      uploads: [upload("a", { imageAttachment: { id: "other" } })],
      message: "Image is already in use, please upload it again",
    },
    {
      name: "an unknown upload or one with another prefix",
      attachments: [image("a")],
      uploads: [],
      message: "Upload not found",
    },
  ])(
    "rejects $name before probing anything",
    async ({ attachments, uploads, message }) => {
      mockPrisma.fileStorageObject.findMany.mockResolvedValue(uploads);

      await expect(
        createPost(res, { ...input, attachments }),
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: `Error uploading file: ${message}`,
      });

      expect(mockProbeImageMeta).not.toHaveBeenCalled();
      expect(mockPrisma.fileStorageObject.update).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    },
  );
});

describe("updatePost", () => {
  const existingImage = {
    type: "image" as const,
    id: "existing",
    title: "New title",
    caption: "",
    description: "",
    alternativeText: "",
  };

  beforeEach(() => {
    mockPrisma.showAndTellEntry.findFirstOrThrow.mockResolvedValue({
      id: "entry",
      approvedAt: null,
      updatedAt: new Date(),
      attachments: [{ imageAttachmentId: "existing" }],
    });
  });

  test("saves nothing when one of the new images is rejected", async () => {
    mockPrisma.fileStorageObject.findMany.mockResolvedValue([
      upload("rejected"),
    ]);
    mockPrisma.fileStorageObject.findUniqueOrThrow.mockResolvedValue(
      upload("rejected"),
    );

    await expect(
      updatePost(res, {
        ...input,
        id: "entry",
        attachments: [existingImage, image("rejected")],
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.imageAttachment.update).not.toHaveBeenCalled();
    expect(mockPrisma.showAndTellEntry.update).not.toHaveBeenCalled();
  });
});
