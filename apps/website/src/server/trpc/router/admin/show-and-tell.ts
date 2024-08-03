import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import {
  addModComment,
  approvePost,
  deleteModComment,
  deletePost,
  getAdminPosts,
  getModCommentsForEntry,
  getPostById,
  markPostAsSeen,
  removeApprovalFromPost,
  showAndTellUpdateInputSchema,
  toggleCommentVisibility,
  unmarkPostAsSeen,
  updatePost,
} from "@/server/db/show-and-tell";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { deleteFileStorageObject } from "@/server/utils/file-storage";
import { notEmpty } from "@/utils/helpers";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageShowAndTell),
);

export const adminShowAndTellRouter = router({
  getEntry: permittedProcedure
    .input(z.string().cuid())
    .query(({ input }) => getPostById(input)),

  getModComments: permittedProcedure
    .input(z.string().cuid())
    .query(async ({ input }) => {
      const comments = await getModCommentsForEntry(input);
      if (!comments) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comments not found",
        });
      }
      return comments;
    }),

  addModComment: permittedProcedure
    .input(
      z.object({
        entryId: z.string().cuid(),
        modId: z.string().cuid(),
        comment: z.string(),
        isInternal: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      return await addModComment(
        input.entryId,
        input.modId,
        input.comment,
        input.isInternal,
      );
    }),

  deleteModComment: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => {
      await deleteModComment(input);
    }),

  toggleCommentVisibility: permittedProcedure
    .input(
      z.object({
        commentId: z.string().cuid(),
        isInternal: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      await toggleCommentVisibility(input.commentId, input.isInternal);
    }),

  review: permittedProcedure
    .input(showAndTellUpdateInputSchema)
    .mutation(async ({ input }) => await updatePost(input, undefined, true)),

  approve: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => await approvePost(input)),

  removeApproval: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => await removeApprovalFromPost(input)),

  markAsSeen: permittedProcedure
    .input(
      z.object({ id: z.string().cuid(), retroactive: z.boolean().optional() }),
    )
    .mutation(
      async ({ input }) => await markPostAsSeen(input.id, input.retroactive),
    ),

  unmarkAsSeen: permittedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => await unmarkPostAsSeen(input.id)),

  delete: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => {
      const post = await getPostById(input);
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      await Promise.allSettled([
        deletePost(post.id),
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
        filter: z.enum(["approved", "pendingApproval"]).optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().cuid().nullish(),
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
