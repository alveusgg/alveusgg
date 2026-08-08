/**
 * apps/website/src/server/trpc/router/wishlist.ts
 *
 * Supports the full donor/staff workflow:
 *   - PRODUCT items (URL-linked, quantity-based) AND custom GOAL items (dollar-based)
 *   - Combined funding: any donation amount stacks toward a GOAL's target
 *   - Donor personal messages, surfaced to staff for on-stream shoutouts
 *   - Two-stage fulfillment: FULFILLED (funded/purchased) -> OPENED (unboxed)
 *
 * Follows the same conventions as router/donations.ts: public procedures for
 * donor-facing actions, protectedProcedure + createCheckPermissionMiddleware
 * for staff-only actions, prisma imported directly (not via ctx).
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

import { fetchUrlMeta } from "@/utils/fetchUrlMeta";
import { createPayPalOrder, capturePayPalOrder } from "@/utils/paypal";
import { logDonationToNeonCrm } from "@/utils/neonCrm";
import { notifyWishlistDonation } from "@/utils/discord";
import { buildAmazonCartUrl } from "@/utils/amazonCart";

// ─── Validators ───────────────────────────────────────────────────────────────

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const statusEnum = z.enum(["NEEDED", "PARTIALLY_FULFILLED", "FULFILLED", "OPENED", "ARCHIVED"]);
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
};

// PRODUCT items require a URL; GOAL items require a dollar target instead.
const itemCreateInput = z.discriminatedUnion("itemType", [
  z.object({
    itemType: z.literal("PRODUCT"),
    ...baseItemFields,
    url: z.string().url(),
    price: z.string().max(50).optional().nullable(),
    quantity: z.number().int().min(1).default(1),
    quantityFulfilled: z.number().int().min(0).default(0),
  }),
  z.object({
    itemType: z.literal("GOAL"),
    ...baseItemFields,
    goalAmountCents: z.number().int().min(100), // minimum $1.00 goal
  }),
]);

// Flat, fully-optional schema for edits. Zod's discriminatedUnion has no
// .partial() method, so updates use a standalone schema covering every
// possible field from both PRODUCT and GOAL shapes instead.
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
  // PRODUCT-only
  url: z.string().url().optional(),
  price: z.string().max(50).optional().nullable(),
  quantity: z.number().int().min(1).optional(),
  quantityFulfilled: z.number().int().min(0).optional(),
  // GOAL-only
  goalAmountCents: z.number().int().min(100).optional(),
  raisedAmountCents: z.number().int().min(0).optional(),
});

const categoryInput = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  sortOrder: z.number().int().default(0),
});

// ─── Router ───────────────────────────────────────────────────────────────────

export const wishlistRouter = router({

  // ── Public: Items ────────────────────────────────────────────────────────────

  getPublicItems: publicProcedure
    .input(z.object({
      categorySlug: z.string().optional(),
      status: statusEnum.optional(),
    }))
    .query(async ({ input }) => {
      return prisma.wishlistItem.findMany({
        where: {
          status: input.status ?? { not: "ARCHIVED" },
          ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
        },
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      });
    }),

  getCategories: publicProcedure.query(async () => {
    return prisma.wishlistCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { items: { where: { status: { not: "ARCHIVED" } } } } },
      },
    });
  }),

  // ── Public: PayPal donate flow ────────────────────────────────────────────────

  createDonateOrder: publicProcedure
    .input(z.object({
      wishlistItemId: z.string(),
      amount: z.number().min(1).max(10_000),
      donorName: z.string().max(100).optional(),
      donorEmail: z.string().email().optional(),
      donorMessage: z.string().max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.wishlistItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      if (item.status === "ARCHIVED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Item is no longer available" });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.alveussanctuary.org";

      const { orderId, approvalUrl } = await createPayPalOrder({
        wishlistItemId: item.id,
        wishlistItemTitle: item.title,
        amount: input.amount,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        returnUrl: `${baseUrl}/wishlist/donate/success?orderId=PAYPAL_ORDER_ID&itemId=${item.id}`,
        cancelUrl: `${baseUrl}/wishlist?donated=cancelled`,
      });

      await prisma.wishlistDonationOrder.create({
        data: {
          paypalOrderId: orderId,
          wishlistItemId: item.id,
          amount: input.amount,
          donorName: input.donorName ?? null,
          donorEmail: input.donorEmail ?? null,
          donorMessage: input.donorMessage ?? null,
          status: "PENDING",
        },
      });

      return { orderId, approvalUrl };
    }),

  captureDonation: publicProcedure
    .input(z.object({
      paypalOrderId: z.string(),
      wishlistItemId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const existing = await prisma.wishlistDonationOrder.findFirst({
        where: { paypalOrderId: input.paypalOrderId },
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.status === "CAPTURED") return { success: true, alreadyCaptured: true };

      const capture = await capturePayPalOrder(input.paypalOrderId);
      if (capture.status !== "COMPLETED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: `PayPal status: ${capture.status}` });
      }

      const item = await prisma.wishlistItem.findUnique({
        where: { id: input.wishlistItemId },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      const neonPromise = logDonationToNeonCrm({
        transactionId: capture.transactionId ?? input.paypalOrderId,
        amount: capture.amount,
        payerEmail: capture.payerEmail ?? existing.donorEmail,
        payerName: capture.payerName ?? existing.donorName,
        wishlistItemId: input.wishlistItemId,
        wishlistItemTitle: item.title,
        donationDate: new Date().toISOString().split("T")[0]!,
      }).catch((err) => {
        console.error("Neon CRM log failed (non-fatal):", err);
        return { success: false as const };
      });

      if (item.itemType === "GOAL") {
        const newRaisedCents = item.raisedAmountCents + Math.round(capture.amount * 100);
        const isFullyFunded = newRaisedCents >= (item.goalAmountCents ?? Infinity);

        await prisma.wishlistItem.update({
          where: { id: item.id },
          data: {
            raisedAmountCents: newRaisedCents,
            status: isFullyFunded
              ? "FULFILLED"
              : newRaisedCents > 0
              ? "PARTIALLY_FULFILLED"
              : item.status,
          },
        });
      } else {
        const newFulfilled = Math.min(item.quantityFulfilled + 1, item.quantity);
        await prisma.wishlistItem.update({
          where: { id: item.id },
          data: {
            quantityFulfilled: newFulfilled,
            status: newFulfilled >= item.quantity
              ? "FULFILLED"
              : newFulfilled > 0
              ? "PARTIALLY_FULFILLED"
              : item.status,
          },
        });
      }

      const neonResult = await neonPromise;

      await prisma.wishlistDonationOrder.update({
        where: { id: existing.id },
        data: {
          status: "CAPTURED",
          capturedAt: new Date(),
          paypalTransactionId: capture.transactionId,
          capturedAmount: capture.amount,
          ...(neonResult.success && "donationId" in neonResult
            ? { neonDonationId: (neonResult as { donationId?: string }).donationId }
            : {}),
        },
      });

      void notifyWishlistDonation({
        itemTitle: item.title,
        amount: capture.amount,
        donorName: existing.donorName,
        donorMessage: existing.donorMessage,
      }).catch((err) => console.error("Discord notify failed (non-fatal):", err));

      return { success: true, amount: capture.amount };
    }),

  // ── Staff (protected): Items ────────────────────────────────────────────────

  fetchUrlMeta: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({ url: z.string().url() }))
    .query(async ({ input }) => fetchUrlMeta(input.url)),

  adminGetAllItems: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({
      status: statusEnum.optional(),
      categoryId: z.string().optional(),
      itemType: itemTypeEnum.optional(),
    }))
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

  adminGetFullyFundedProducts: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .query(async () => {
      const items = await prisma.wishlistItem.findMany({
        where: { itemType: "PRODUCT", status: "FULFILLED" },
        include: { category: true },
        orderBy: { updatedAt: "desc" },
      });

      const amazonItems = items.filter((i) => i.url?.includes("amazon."));
      const cartUrl = amazonItems.length > 0 ? buildAmazonCartUrl(amazonItems) : null;

      return { items, amazonCartUrl: cartUrl };
    }),

  createItem: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
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

  updateItem: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(itemUpdateInput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const existing = await prisma.wishlistItem.findUnique({ where: { id } });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      return prisma.wishlistItem.update({ where: { id }, data, include: { category: true } });
    }),

  markAsOpened: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const item = await prisma.wishlistItem.findUnique({ where: { id: input.id } });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      if (item.status !== "FULFILLED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Item must be fully funded before it can be marked as opened" });
      }
      return prisma.wishlistItem.update({
        where: { id: input.id },
        data: { status: "OPENED" },
      });
    }),

  deleteItem: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({ id: z.string(), permanent: z.boolean().default(false) }))
    .mutation(async ({ input }) => {
      if (input.permanent) {
        await prisma.wishlistItem.delete({ where: { id: input.id } });
      } else {
        await prisma.wishlistItem.update({ where: { id: input.id }, data: { status: "ARCHIVED" } });
      }
      return { success: true };
    }),

  reorderItems: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({ orderedIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      await prisma.$transaction(
        input.orderedIds.map((id, idx) =>
          prisma.wishlistItem.update({ where: { id }, data: { sortOrder: idx } })
        )
      );
      return { success: true };
    }),

  // ── Staff (protected): Categories ─────────────────────────────────────────────

  createCategory: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(categoryInput)
    .mutation(async ({ input }) => prisma.wishlistCategory.create({ data: input })),

  updateCategory: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(categoryInput.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.wishlistCategory.update({ where: { id }, data });
    }),

  deleteCategory: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.wishlistItem.updateMany({ where: { categoryId: input.id }, data: { categoryId: null } });
      await prisma.wishlistCategory.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ── Staff (protected): Donations ──────────────────────────────────────────────

  adminGetDonations: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({
      status: z.enum(["PENDING", "CAPTURED", "FAILED"]).optional(),
      unreadMessagesOnly: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      return prisma.wishlistDonationOrder.findMany({
        where: {
          ...(input.status ? { status: input.status } : {}),
          ...(input.unreadMessagesOnly
            ? { donorMessage: { not: null }, messageReadAt: null }
            : {}),
        },
        include: { wishlistItem: { select: { title: true, id: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    }),

  markMessageRead: protectedProcedure
    .use(createCheckPermissionMiddleware(permissions.manageWishlist))
    .input(z.object({ donationOrderId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.wishlistDonationOrder.update({
        where: { id: input.donationOrderId },
        data: { messageReadAt: new Date() },
      });
    }),
});
