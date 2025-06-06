import { z } from "zod/v4";

import {
  createShortLink,
  editShortLink,
  shortLinkSchema,
} from "@/server/db/short-links";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageShortLinks),
);

export const adminShortLinksRouter = router({
  createOrEditShortLink: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.cuid() }),
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

  deleteShortLink: permittedProcedure
    .input(z.cuid())
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.shortLinks.delete({ where: { id: id } });
      await ctx.prisma.shortLinksTracking.delete({ where: { id: id } });
    }),

  getShortLink: permittedProcedure
    .input(z.cuid())
    .query(({ ctx, input: id }) =>
      ctx.prisma.shortLinks.findUnique({ where: { id } }),
    ),

  getShortLinks: permittedProcedure.query(({ ctx }) =>
    ctx.prisma.shortLinks.findMany({}),
  ),

  getShortLinkClicks: permittedProcedure.query(({ ctx }) =>
    ctx.prisma.shortLinksTracking.findMany({}),
  ),
});
