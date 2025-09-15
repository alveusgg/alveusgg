import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  approvePost,
  deletePost,
  getAdminPost,
  getAdminPosts,
  markPostAsSeen,
  markPostAsSeenModeSchema,
  removeApprovalFromPost,
  showAndTellReviewInputSchema,
  unmarkPostAsSeen,
  updatePost,
} from "@/server/db/show-and-tell";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { deleteFileStorageObject } from "@/server/utils/file-storage";

import { permissions } from "@/data/permissions";

import { notEmpty } from "@/utils/helpers";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageShowAndTell),
);

export const adminShowAndTellRouter = router({
  getEntry: permittedProcedure
    .input(z.cuid())
    .query(({ input }) => getAdminPost(input)),

  review: permittedProcedure
    .input(showAndTellReviewInputSchema)
    .mutation(
      async ({ ctx, input }) =>
        await updatePost(ctx.res, input, undefined, true),
    ),

  approve: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ ctx, input }) => await approvePost(ctx.res, input)),

  removeApproval: permittedProcedure
    .input(z.cuid())
    .mutation(
      async ({ ctx, input }) => await removeApprovalFromPost(ctx.res, input),
    ),

  markAsSeen: permittedProcedure
    .input(
      z.object({
        id: z.cuid(),
        mode: markPostAsSeenModeSchema,
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await markPostAsSeen(ctx.res, input.id, input.mode),
    ),

  unmarkAsSeen: permittedProcedure
    .input(z.object({ id: z.cuid() }))
    .mutation(
      async ({ ctx, input }) => await unmarkPostAsSeen(ctx.res, input.id),
    ),

  delete: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ ctx, input }) => {
      const post = await getAdminPost(input);
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      await Promise.allSettled([
        deletePost(ctx.res, post.id),
        // Delete all file attachments
        ...post.attachments
          .map(({ imageAttachment }) => imageAttachment?.fileStorageObject?.id)
          .filter(notEmpty)
          .map((id) => deleteFileStorageObject(id)),
      ]);
    }),

  getEntries: permittedProcedure
    .input(
      z.object({
        filter: z.literal(["approved", "pendingApproval"]).optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.cuid().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 20;
      const { cursor } = input;

      const items = await getAdminPosts({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor || undefined,
        filter: input.filter,
      });

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id || undefined;
      }

      return { items, nextCursor };
    }),
});
