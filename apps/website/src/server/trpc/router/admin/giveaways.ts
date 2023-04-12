import { z } from "zod";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
  superUserProcedure,
} from "@/server/trpc/trpc";
import { permissions } from "@/config/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageGiveaways)
);

export const adminGiveawaysRouter = router({
  createGiveaway: permittedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.giveaway.create({
        data: {
          active: false,
          slug: "",
          config: "{}",
          showInLists: false,
          label: "",
        },
      });
    }),

  getGiveaways: permittedProcedure.query(async ({ ctx }) =>
    ctx.prisma.giveaway.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
    })
  ),
  toggleGiveawayStatus: permittedProcedure
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
  updateGiveawayOutgoingWebhookUrl: permittedProcedure
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
