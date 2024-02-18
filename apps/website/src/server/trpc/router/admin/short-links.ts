import { z } from "zod";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { permissions } from "@/config/permissions";
import {
  createShortLink,
  editShortLink,
  shortLinkSchema,
} from "@/server/db/short-links";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageShortLinks),
);

export const shortLinksRouter = router({
  createOrEditShortLink: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.string().cuid() }),
        ])
        .and(shortLinkSchema),
    )
    .mutation(async ({ input }) => {
      switch (input.action) {
        case "create": {
          const { action: _, ...data } = input;
          await createShortLink(data);
          break;
        }
        case "edit": {
          const { action: _, ...data } = input;
          await editShortLink(data);
          break;
        }
      }
    }),

  deleteLink: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) => {
      ctx.prisma.shortLinks.delete({ where: { id: id } });
      ctx.prisma.shortLinksTracking.delete({ where: { id: id } });
    }),

  getLink: permittedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input: id }) =>
      ctx.prisma.shortLinks.findUnique({ where: { id } }),
    ),

  getLinks: permittedProcedure.query(async ({ ctx }) =>
    ctx.prisma.shortLinks.findMany({}),
  ),

  getClicks: permittedProcedure.query(async ({ ctx }) =>
    ctx.prisma.shortLinksTracking.findMany({}),
  ),
});
