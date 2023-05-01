import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { retryOutgoingWebhook } from "@/server/outgoing-webhooks";
import { router, superUserProcedure } from "../../trpc";

export const adminActivityFeedRouter = router({
  getOutgoingWebhooks: superUserProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().cuid().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await ctx.prisma.outgoingWebhook.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
          formEntry: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id || undefined;
      }

      return { items, nextCursor };
    }),

  retryOutgoingWebhook: superUserProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const outgoingWebhook = await ctx.prisma.outgoingWebhook.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!outgoingWebhook) {
        throw new TRPCError({
          message: "Outgoing webhook not found",
          code: "NOT_FOUND",
        });
      }

      const success = await retryOutgoingWebhook(outgoingWebhook);
      return {
        success,
      };
    }),
});
