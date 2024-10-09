import { z } from "zod";
import { permissions } from "@/data/permissions";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { approveClip, unapproveClip, deleteClip } from "@/server/db/clips";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageClips),
);

export const adminClipsRouter = router({
  unapproveClip: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => await unapproveClip(input)),

  approveClip: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => await approveClip(input)),

  deleteClip: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => await deleteClip(input)),
});
