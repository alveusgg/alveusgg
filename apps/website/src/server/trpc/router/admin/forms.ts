import { z } from "zod";

import { createForm, editForm, formSchema } from "@/server/db/forms";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageForms),
);

export const adminFormsRouter = router({
  createOrEditForm: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.cuid() }),
        ])
        .and(formSchema),
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
    .input(z.cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.form.delete({ where: { id } }),
    ),

  purgeFormEntries: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.formEntry.deleteMany({
        where: {
          formId: id,
        },
      }),
    ),

  anonymizeFormEntries: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ ctx, input: id }) =>
      Promise.all([
        ctx.prisma.formEntry.updateMany({
          where: {
            formId: id,
          },
          data: {
            familyName: "",
            givenName: "",
            email: "",
          },
        }),
        ctx.prisma.mailingAddress.deleteMany({
          where: {
            formEntry: {
              formId: id,
            },
          },
        }),
      ]),
    ),

  getForm: permittedProcedure
    .input(z.cuid())
    .query(async ({ ctx, input: id }) =>
      ctx.prisma.form.findUnique({ where: { id } }),
    ),

  getForms: permittedProcedure.query(async ({ ctx }) =>
    ctx.prisma.form.findMany({
      include: {
        _count: {
          select: { entries: true },
        },
      },
    }),
  ),

  toggleFormStatus: permittedProcedure
    .input(
      z.object({
        id: z.cuid(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.form.update({
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
        id: z.cuid(),
        outgoingWebhookUrl: z.url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all([
        ctx.prisma.form.update({
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
