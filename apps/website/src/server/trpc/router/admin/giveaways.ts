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
});
