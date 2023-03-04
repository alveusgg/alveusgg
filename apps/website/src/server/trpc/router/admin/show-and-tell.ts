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
} from "@/server/db/show-and-tell";
import { permissions } from "@/config/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageShowAndTell)
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

  delete: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => {
      const post = await getPostById(input);
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return await deletePost(post.id);
    }),

  getEntries: permittedProcedure
    .input(
      z.object({
        filter: z.enum(["approved", "pendingApproval"]).optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().cuid().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;
      const { cursor } = input;

      const items = await ctx.prisma.showAndTellEntry.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        where:
          input.filter === "pendingApproval"
            ? {
                OR: [
                  {
                    approvedAt: null,
                  },
                  {
                    approvedAt: {
                      lt: ctx.prisma.showAndTellEntry.fields.updatedAt,
                    },
                  },
                ],
              }
            : input.filter === "approved"
            ? {
                approvedAt: {
                  gte: ctx.prisma.showAndTellEntry.fields.updatedAt,
                },
              }
            : {},
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id || undefined;
      }

      return { items, nextCursor };
    }),
});
