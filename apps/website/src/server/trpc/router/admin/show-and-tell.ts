import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import {
  showAndTellUpdateInputSchema,
  updatePost,
  approvePost,
  removeApprovalFromPost,
  deletePost,
  getPostById,
  markPostAsSeen,
  unmarkPostAsSeen,
  getAdminPosts,
} from "@/server/db/show-and-tell";
import { permissions } from "@/config/permissions";
import { deleteFileStorageObject } from "@/server/utils/file-storage";
import { notEmpty } from "@/utils/helpers";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageShowAndTell),
);

export const adminShowAndTellRouter = router({
  getEntry: permittedProcedure
    .input(z.string().cuid())
    .query(({ input }) => getPostById(input)),

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
