import { z } from "zod";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { permissions } from "@/config/permissions";
import { createForm, editForm, formSchema } from "@/server/db/short-links";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageShortLinks),
);

export const shortLinksRouter = router({
  createOrEditForm: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.string().cuid() }),
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

  deleteLink: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) =>
      ctx.prisma.shortLinks.delete({ where: { id } }),
    ),

  getLink: permittedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) =>
      ctx.prisma.shortLinks.findUnique({ where: { id } }),
    ),

  getLinks: permittedProcedure.query(async ({ ctx }) =>
    ctx.prisma.shortLinks.findMany({}),
  ),
});
