import { z } from "zod";

import {
  createRoundsCheck,
  editRoundsCheck,
  moveRoundsCheck,
  roundsCheckSchema,
} from "@/server/db/rounds-checks";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";

import { permissions } from "@/data/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageRoundsChecks),
);

export const adminRoundsChecksRouter = router({
  createOrEditRoundsCheck: permittedProcedure
    .input(
      z
        .discriminatedUnion("action", [
          z.object({ action: z.literal("create") }),
          z.object({ action: z.literal("edit"), id: z.string().cuid() }),
        ])
        .and(roundsCheckSchema),
    )
    .mutation(async ({ input }) => {
      switch (input.action) {
        case "create": {
          const { action: _, ...data } = input;
          await createRoundsCheck(data);
          break;
        }
        case "edit": {
          const { action: _, ...data } = input;
          await editRoundsCheck(data);
          break;
        }
      }
    }),

  moveRoundsCheck: permittedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        direction: z.enum(["up", "down"]),
      }),
    )
    .mutation(async ({ input }) => {
      await moveRoundsCheck(input.id, input.direction);
    }),

  deleteRoundsCheck: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input: id }) => {
      await ctx.prisma.roundsCheck.delete({ where: { id: id } });
    }),

  getRoundsCheck: permittedProcedure
    .input(z.string().cuid())
    .query(({ ctx, input: id }) =>
      ctx.prisma.roundsCheck.findUnique({ where: { id } }),
    ),

  getRoundsChecks: permittedProcedure.query(({ ctx }) =>
    ctx.prisma.roundsCheck.findMany({ orderBy: { order: "asc" } }),
  ),
});
