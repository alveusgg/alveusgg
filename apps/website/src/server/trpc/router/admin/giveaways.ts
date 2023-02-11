import { z } from "zod";
import { router, superUserProcedure } from "../../trpc";

export const adminGiveawaysRouter = router({
  getGiveaways: superUserProcedure.query(async ({ ctx }) =>
    ctx.prisma.giveaway.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
    })
  ),
  toggleGiveawayStatus: superUserProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        active: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.giveaway.update({
        where: {
          id: input.id,
        },
        data: {
          active: input.active,
        },
      });
    }),
  updateGiveawayOutgoingWebhookUrl: superUserProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        outgoingWebhookUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all([
        ctx.prisma.giveaway.update({
          where: {
            id: input.id,
          },
          data: {
            outgoingWebhookUrl: input.outgoingWebhookUrl,
          },
        }),
        ctx.prisma.outgoingWebhook.updateMany({
          where: {
            type: "giveaway-entry",
          },
          data: {
            url: input.outgoingWebhookUrl,
          },
        }),
      ]);
    }),
});
