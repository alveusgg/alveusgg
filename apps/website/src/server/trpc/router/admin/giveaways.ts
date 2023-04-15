import { z } from "zod";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { permissions } from "@/config/permissions";
import {
  createGiveaway,
  editGiveaway,
  giveawaySchema,
} from "@/server/db/giveaways";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageGiveaways)
);

export const adminGiveawaysRouter = router({
  createOrEditGiveaway: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.string().cuid() }),
        ])
        .and(giveawaySchema)
    )
    .mutation(async ({ input }) => {
      switch (input.action) {
        case "create": {
          const { action: _, ...data } = input;
          await createGiveaway(data);
          break;
        }
        case "edit": {
          const { action: _, ...data } = input;
          await editGiveaway(data);
          break;
        }
      }
    }),

  deleteGiveaway: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.giveaway.delete({ where: { id } })
    ),

  purgeGiveawayEntries: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.giveawayEntry.deleteMany({
        where: {
          giveawayId: id,
        },
      })
    ),

  anonymizeGiveawayEntries: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      Promise.all([
        ctx.prisma.giveawayEntry.updateMany({
          where: {
            giveawayId: id,
          },
          data: {
            familyName: "",
            givenName: "",
            email: "",
          },
        }),
        ctx.prisma.mailingAddress.deleteMany({
          where: {
            giveawayEntry: {
              giveawayId: id,
            },
          },
        }),
      ])
    ),

  getGiveaway: permittedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) =>
      ctx.prisma.giveaway.findUnique({ where: { id } })
    ),

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
