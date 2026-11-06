import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

import { buildAmazonCartUrl } from "@/utils/amazonCart";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const statusEnum = z.enum([
  "NEEDED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "OPENED",
  "ARCHIVED",
]);
const itemTypeEnum = z.enum(["PRODUCT", "GOAL"]);

const baseItemFields = {
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  priority: priorityEnum.default("MEDIUM"),
  status: statusEnum.default("NEEDED"),
  categoryId: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  sortOrder: z.number().int().default(0),
  allowPartialDonations: z.boolean().default(false),
};

const itemCreateInput = z.discriminatedUnion("itemType", [
  z.object({
    itemType: z.literal("PRODUCT"),
    ...baseItemFields,
    url: z.string().url().optional().nullable(),
    price: z.string().max(50).optional().nullable(),
    quantity: z.number().int().min(1).default(1),
    quantityFulfilled: z.number().int().min(0).default(0),
    // Target for partial donations, defaults to price x quantity when unset
    goalAmountCents: z.number().int().min(100).optional().nullable(),
  }),
  z.object({
    itemType: z.literal("GOAL"),
    ...baseItemFields,
    goalAmountCents: z.number().int().min(100),
  }),
]);

const itemUpdateInput = z.object({
  id: z.string(),
  itemType: itemTypeEnum.optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  categoryId: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  sortOrder: z.number().int().optional(),
  url: z.string().url().optional().nullable(),
  price: z.string().max(50).optional().nullable(),
  quantity: z.number().int().min(1).optional(),
  quantityFulfilled: z.number().int().min(0).optional(),
  goalAmountCents: z.number().int().min(100).optional().nullable(),
  raisedAmountCents: z.number().int().min(0).optional(),
  allowPartialDonations: z.boolean().optional(),
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
      return prisma.wishlistItem.findMany({
        where: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
          ...(input.itemType ? { itemType: input.itemType } : {}),
        },
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
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
      return prisma.wishlistItem.create({
        data: {
          ...input,
          imageUrl: input.imageUrl ?? null,
          notes: input.notes ?? null,
          categoryId: input.categoryId ?? null,
          ...(input.itemType === "PRODUCT"
            ? { price: input.price ?? null }
            : { raisedAmountCents: 0 }),
        },
        include: { category: true },
      });
    }),

  updateItem: permittedProcedure
    .input(itemUpdateInput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const existing = await prisma.wishlistItem.findUnique({ where: { id } });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.wishlistItem.update({
        where: { id },
        data,
        include: { category: true },
      });
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
        await prisma.wishlistItem.delete({ where: { id: input.id } });
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

  adminGetDonations: permittedProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "CAPTURED", "FAILED"]).optional(),
        unreadMessagesOnly: z.boolean().optional(),
        wishlistItemId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      return prisma.wishlistDonationOrder.findMany({
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
        orderBy: { createdAt: "desc" },
        take: 200,
      });
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
