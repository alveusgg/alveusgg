import { z } from "zod";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { permissions } from "@/config/permissions";
import { createForm, editForm, formSchema } from "@/server/db/forms";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageForms)
);

export const adminFormsRouter = router({
  createOrEditForm: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.string().cuid() }),
        ])
        .and(formSchema)
    )
    .mutation(async ({ input }) => {
      switch (input.action) {
        case "create": {
          const { action: _, ...data } = input;
          await createForm(data);
          break;
        }
        case "edit": {
          const { action: _, ...data } = input;
          await editForm(data);
          break;
        }
      }
    }),

  deleteForm: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.giveaway.delete({ where: { id } })
    ),

  purgeFormEntries: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.giveawayEntry.deleteMany({
        where: {
          giveawayId: id,
        },
      })
    ),

  anonymizeFormEntries: permittedProcedure
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

  getForm: permittedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) =>
      ctx.prisma.giveaway.findUnique({ where: { id } })
    ),

  getForms: permittedProcedure.query(async ({ ctx }) =>
    ctx.prisma.giveaway.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
    })
  ),

  toggleFormStatus: permittedProcedure
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

  updateFormOutgoingWebhookUrl: permittedProcedure
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
            type: "form-entry",
          },
          data: {
            url: input.outgoingWebhookUrl,
          },
        }),
      ]);
    }),
});
