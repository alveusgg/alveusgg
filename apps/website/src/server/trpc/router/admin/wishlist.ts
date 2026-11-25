import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import { env } from "@/env";

import { getUserByName } from "@/server/apis/twitch";
import {
  deleteWishlistImage,
  saveWithWishlistImageUpload,
  wishlistImageUploadPrefix,
} from "@/server/db/wishlist";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import {
  createFileStorageUpload,
  getViewUrlForFileStorageObjectKey,
  imageUploadInputSchema,
} from "@/server/utils/file-storage";

import { permissions } from "@/data/permissions";

import { buildAmazonCartUrl } from "@/utils/amazonCart";
import {
  DONATION_ORDER_STATUSES,
  PAYMENT_ISSUE_STATUSES,
  getPartialTargetCents,
  isFullPriceDonatable,
  normalizePrice,
  parsePriceCents,
} from "@/utils/wishlist";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const statusEnum = z.enum([
  "NEEDED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "OPENED",
  "ARCHIVED",
]);
const itemTypeEnum = z.enum(["PRODUCT", "GOAL"]);

const DONATIONS_PER_PAGE = 50;

const quantityFulfilledWithinQuantity = (item: {
  quantity?: number;
  quantityFulfilled?: number;
}) =>
  item.quantity === undefined ||
  item.quantityFulfilled === undefined ||
  item.quantityFulfilled <= item.quantity;

const QUANTITY_FULFILLED_ERROR =
  "Quantity fulfilled cannot be more than the quantity";

const PRICE_ERROR =
  "Enter the price as a dollar amount, like 24.99 or 1,547.00";
const PARTIAL_TARGET_ERROR =
  "Partial donations need a readable price or a funding target";

const FULL_PRICE_BOUNDS_ERROR =
  "A full-price product must cost between $1.00 and $10,000.00. Turn on partial donations for more expensive items.";

const rawPrice = z.string().max(50).nullish();

const requiredPrice = rawPrice.transform((value, ctx) => {
  const cents = parsePriceCents(value);
  if (cents == null) {
    ctx.addIssue({ code: "custom", message: PRICE_ERROR });
    return z.NEVER;
  }
  return normalizePrice(cents);
});

function assertPartialTarget(item: {
  allowPartialDonations: boolean;
  goalAmountCents: number | null;
  price: string | null;
  quantity: number;
}) {
  if (item.allowPartialDonations && getPartialTargetCents(item) == null) {
    throw new TRPCError({ code: "BAD_REQUEST", message: PARTIAL_TARGET_ERROR });
  }
}

function assertFullPriceBounds(item: {
  allowPartialDonations: boolean;
  price: string | null;
}) {
  if (!isFullPriceDonatable({ itemType: "PRODUCT", ...item })) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: FULL_PRICE_BOUNDS_ERROR,
    });
  }
}

const baseItemFields = {
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional().nullable(),
  fileStorageObjectId: z.cuid().optional().nullable(),
  priority: priorityEnum.default("MEDIUM"),
  status: statusEnum.default("NEEDED"),
  categoryId: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  sortOrder: z.number().int().default(0),
  allowPartialDonations: z.boolean().default(false),
};

const itemCreateInput = z.discriminatedUnion("itemType", [
  z
    .object({
      itemType: z.literal("PRODUCT"),
      ...baseItemFields,
      url: z.string().url().optional().nullable(),
      price: requiredPrice,
      quantity: z.number().int().min(1).default(1),
      quantityFulfilled: z.number().int().min(0).default(0),
      // Target for partial donations, defaults to price x quantity when unset
      goalAmountCents: z.number().int().min(100).optional().nullable(),
    })
    .refine(quantityFulfilledWithinQuantity, {
      message: QUANTITY_FULFILLED_ERROR,
      path: ["quantityFulfilled"],
    }),
  z.object({
    itemType: z.literal("GOAL"),
    ...baseItemFields,
    goalAmountCents: z.number().int().min(100),
  }),
]);

// itemType is fixed at creation, so it is not accepted here
const itemUpdateInput = z
  .object({
    id: z.string(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    fileStorageObjectId: z.cuid().optional().nullable(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    categoryId: z.string().optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    sortOrder: z.number().int().optional(),
    url: z.string().url().optional().nullable(),
    price: rawPrice,
    quantity: z.number().int().min(1).optional(),
    quantityFulfilled: z.number().int().min(0).optional(),
    goalAmountCents: z.number().int().min(100).optional().nullable(),
    raisedAmountCents: z.number().int().min(0).optional(),
    allowPartialDonations: z.boolean().optional(),
  })
  .refine(quantityFulfilledWithinQuantity, {
    message: QUANTITY_FULFILLED_ERROR,
    path: ["quantityFulfilled"],
  });

const categoryInput = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  sortOrder: z.number().int().optional(),
});

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageWishlist),
);

export const adminWishlistRouter = router({
  adminGetAllItems: permittedProcedure
    .input(
      z.object({
        status: statusEnum.optional(),
        categoryId: z.string().optional(),
        itemType: itemTypeEnum.optional(),
      }),
    )
    .query(async ({ input }) => {
      const items = await prisma.wishlistItem.findMany({
        where: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.itemType ? { itemType: input.itemType } : {}),
        },
        include: { category: true, fileStorageObject: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });

      return items.map(({ fileStorageObject, ...item }) => ({
        ...item,
        fileStorageObjectUrl: fileStorageObject
          ? String(getViewUrlForFileStorageObjectKey(fileStorageObject.key))
          : null,
      }));
    }),

  adminGetFullyFundedProducts: permittedProcedure.query(async () => {
    const items = await prisma.wishlistItem.findMany({
      where: { itemType: "PRODUCT", status: "FULFILLED" },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });

    const amazonItems = items.filter((i) => i.url?.includes("amazon."));
    const cartUrl =
      amazonItems.length > 0 ? buildAmazonCartUrl(amazonItems) : null;

    return { items, amazonCartUrl: cartUrl };
  }),

  createItem: permittedProcedure
    .input(itemCreateInput)
    .mutation(async ({ input }) => {
      if (input.itemType === "PRODUCT") {
        assertPartialTarget({
          allowPartialDonations: input.allowPartialDonations,
          goalAmountCents: input.goalAmountCents ?? null,
          price: input.price,
          quantity: input.quantity,
        });
        assertFullPriceBounds(input);
      }
      return saveWithWishlistImageUpload(input.fileStorageObjectId, () =>
        prisma.wishlistItem.create({
          data: {
            ...input,
            fileStorageObjectId: input.fileStorageObjectId ?? null,
            notes: input.notes ?? null,
            categoryId: input.categoryId ?? null,
            ...(input.itemType === "PRODUCT"
              ? { price: input.price ?? null }
              : { raisedAmountCents: 0 }),
          },
          include: { category: true },
        }),
      );
    }),

  updateItem: permittedProcedure
    .input(itemUpdateInput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const existing = await prisma.wishlistItem.findUnique({ where: { id } });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      if (existing.itemType === "GOAL") {
        const productFields = [
          data.url,
          data.price,
          data.quantity,
          data.quantityFulfilled,
        ];
        if (productFields.some((value) => value !== undefined)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Goals cannot have product fields",
          });
        }
        if (data.goalAmountCents === null) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Goals need a target amount",
          });
        }
      }

      const quantity = data.quantity ?? existing.quantity;
      if ((data.quantityFulfilled ?? existing.quantityFulfilled) > quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: QUANTITY_FULFILLED_ERROR,
        });
      }

      if (existing.itemType === "PRODUCT") {
        // The edit form resends every field, so only a changed price is
        // checked and legacy items can still be archived or re-statused
        if (data.price !== undefined) {
          const sent = data.price?.trim() ?? "";
          if (sent === (existing.price?.trim() ?? "")) {
            delete data.price;
          } else {
            const cents = parsePriceCents(data.price);
            if (cents == null) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: PRICE_ERROR,
              });
            }
            data.price = normalizePrice(cents);
          }
        }

        const next = {
          allowPartialDonations:
            data.allowPartialDonations ?? existing.allowPartialDonations,
          goalAmountCents:
            data.goalAmountCents !== undefined
              ? data.goalAmountCents
              : existing.goalAmountCents,
          price: data.price ?? existing.price,
          quantity,
        };
        const targetChanged =
          next.allowPartialDonations !== existing.allowPartialDonations ||
          next.goalAmountCents !== existing.goalAmountCents ||
          next.price !== existing.price ||
          next.quantity !== existing.quantity;
        if (targetChanged) assertPartialTarget(next);
        if (
          next.price !== existing.price ||
          next.allowPartialDonations !== existing.allowPartialDonations
        ) {
          assertFullPriceBounds(next);
        }
      }

      // Only new uploads, since a failed check deletes the checked object
      const newUpload =
        data.fileStorageObjectId !== existing.fileStorageObjectId
          ? data.fileStorageObjectId
          : null;
      const updated = await saveWithWishlistImageUpload(newUpload, () =>
        prisma.wishlistItem.update({
          where: { id },
          data,
          include: { category: true },
        }),
      );

      // A replaced or removed upload is no longer linked anywhere
      if (
        data.fileStorageObjectId !== undefined &&
        existing.fileStorageObjectId &&
        existing.fileStorageObjectId !== data.fileStorageObjectId
      ) {
        await deleteWishlistImage(existing.fileStorageObjectId);
      }

      return updated;
    }),

  markAsOpened: permittedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.id },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      if (item.status !== "FULFILLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Item must be fully funded before it can be marked as opened",
        });
      }
      return prisma.wishlistItem.update({
        where: { id: input.id },
        data: { status: "OPENED" },
      });
    }),

  deleteItem: permittedProcedure
    .input(z.object({ id: z.string(), permanent: z.boolean().default(false) }))
    .mutation(async ({ input }) => {
      if (input.permanent) {
        const deleted = await prisma.wishlistItem.delete({
          where: { id: input.id },
        });
        if (deleted.fileStorageObjectId) {
          await deleteWishlistImage(deleted.fileStorageObjectId);
        }
      } else {
        await prisma.wishlistItem.update({
          where: { id: input.id },
          data: { status: "ARCHIVED" },
        });
      }
      return { success: true };
    }),

  reorderItems: permittedProcedure
    .input(z.object({ orderedIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      await prisma.$transaction(
        input.orderedIds.map((id, idx) =>
          prisma.wishlistItem.update({
            where: { id },
            data: { sortOrder: idx },
          }),
        ),
      );
      return { success: true };
    }),

  createCategory: permittedProcedure
    .input(categoryInput)
    .mutation(async ({ input }) => {
      // New categories go to the end of the list unless an order is given
      const last = await prisma.wishlistCategory.findFirst({
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      return prisma.wishlistCategory.create({
        data: {
          ...input,
          sortOrder: input.sortOrder ?? (last ? last.sortOrder + 1 : 0),
        },
      });
    }),

  // Includes archived categories, unlike the public getCategories
  adminGetAllCategories: permittedProcedure.query(async () =>
    prisma.wishlistCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { items: true } } },
    }),
  ),

  // The slug is set at creation and never changes, so renames keep links working
  updateCategory: permittedProcedure
    .input(
      categoryInput
        .pick({ name: true, sortOrder: true })
        .extend({ id: z.string() }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.wishlistCategory.update({ where: { id }, data });
    }),

  // Categories are archived rather than deleted, so items keep their category
  archiveCategory: permittedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) =>
      prisma.wishlistCategory.update({
        where: { id: input.id },
        data: { archivedAt: new Date() },
      }),
    ),

  unarchiveCategory: permittedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) =>
      prisma.wishlistCategory.update({
        where: { id: input.id },
        data: { archivedAt: null },
      }),
    ),

  reorderCategories: permittedProcedure
    .input(z.object({ orderedIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      await prisma.$transaction(
        input.orderedIds.map((id, idx) =>
          prisma.wishlistCategory.update({
            where: { id },
            data: { sortOrder: idx },
          }),
        ),
      );
      return { success: true };
    }),

  adminGetChatChannels: permittedProcedure.query(() =>
    prisma.wishlistChatChannel.findMany({ orderBy: { createdAt: "asc" } }),
  ),

  addChatChannel: permittedProcedure
    .input(
      z.object({
        username: z
          .string()
          .trim()
          .regex(/^@?\w{1,25}$/, "Enter a Twitch channel name"),
      }),
    )
    .mutation(async ({ input }) => {
      // Stored by user ID, so a renamed channel keeps getting messages
      const user = await getUserByName(input.username.replace(/^@/, ""));
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Twitch channel with that name",
        });
      }
      await prisma.wishlistChatChannel.upsert({
        where: { channelId: user.id },
        create: { channelId: user.id, username: user.login },
        update: { username: user.login },
      });
    }),

  removeChatChannel: permittedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.wishlistChatChannel.deleteMany({
        where: { channelId: input.channelId },
      });
    }),

  adminGetDonations: permittedProcedure
    .input(
      z.object({
        status: z.enum(DONATION_ORDER_STATUSES).optional(),
        unreadMessagesOnly: z.boolean().optional(),
        wishlistItemId: z.string().optional(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const donations = await prisma.wishlistDonationOrder.findMany({
        where: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.wishlistItemId
            ? { wishlistItemId: input.wishlistItemId }
            : {}),
          ...(input.unreadMessagesOnly
            ? { donorMessage: { not: null }, messageReadAt: null }
            : {}),
        },
        include: { wishlistItem: { select: { title: true, id: true } } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: DONATIONS_PER_PAGE + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (donations.length > DONATIONS_PER_PAGE) {
        nextCursor = donations.pop()?.id;
      }

      return { donations, nextCursor };
    }),

  adminGetDonationTotals: permittedProcedure
    .input(z.object({ wishlistItemId: z.string().optional() }))
    .query(async ({ input }) => {
      const groups = await prisma.wishlistDonationOrder.groupBy({
        by: ["status"],
        where: input.wishlistItemId
          ? { wishlistItemId: input.wishlistItemId }
          : {},
        _count: { _all: true },
        _sum: { capturedAmount: true },
      });

      const captured = groups.find((g) => g.status === "CAPTURED");
      return {
        orders: groups.reduce((sum, g) => sum + g._count._all, 0),
        captured: captured?._count._all ?? 0,
        pending: groups.find((g) => g.status === "PENDING")?._count._all ?? 0,
        paymentIssues: groups
          .filter((g) =>
            (PAYMENT_ISSUE_STATUSES as readonly string[]).includes(g.status),
          )
          .reduce((sum, g) => sum + g._count._all, 0),
        capturedAmount: captured?._sum.capturedAmount ?? 0,
      };
    }),

  createFileUpload: permittedProcedure
    .input(imageUploadInputSchema)
    .mutation(async ({ input }) => {
      const { uploadUrl, viewUrl, fileStorageObject } =
        await createFileStorageUpload({
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          prefix: wishlistImageUploadPrefix,
        });

      if (env.NODE_ENV === "development") {
        // DO Spaces needs ssl, so uploads in development are proxied through
        // the Next.js server (see the rounds checks router)
        return {
          viewUrl: String(viewUrl),
          uploadUrl: `/api/file-upload${uploadUrl.pathname}${uploadUrl.search}`,
          fileStorageObjectId: fileStorageObject.id,
        };
      }

      return {
        viewUrl: String(viewUrl),
        uploadUrl: String(uploadUrl),
        fileStorageObjectId: fileStorageObject.id,
      };
    }),

  markMessageRead: permittedProcedure
    .input(z.object({ donationOrderId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.wishlistDonationOrder.update({
        where: { id: input.donationOrderId },
        data: { messageReadAt: new Date() },
      });
    }),
});
