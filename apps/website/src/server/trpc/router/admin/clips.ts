import { z } from "zod";
import { permissions } from "@/config/permissions";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { approveClip, deleteClip } from "@/server/db/clips";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageClips),
);

export const adminClipsRouter = router({
  approveClip: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => await approveClip(input)),

  deleteClip: permittedProcedure
    .input(z.string().cuid())
    .mutation(async ({ input }) => await deleteClip(input)),
});
