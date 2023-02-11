import { router, superUserProcedure } from "../../trpc";

export const adminRafflesRouter = router({
  getRaffles: superUserProcedure.query(async ({ ctx }) =>
    ctx.prisma.raffle.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
    })
  ),
});
