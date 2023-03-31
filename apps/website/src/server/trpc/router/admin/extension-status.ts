import { z } from "zod";
import { parse, stringify } from "superjson";
import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "../../trpc";
import { permissions } from "@/config/permissions";

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageExtensionStatus)
);

const extensionStatusDataSchema = z.object({
  overlay: z.string(),
});

export const adminExtensionStatusRouter = router({
  getExtensionStatus: permittedProcedure
    .input(
      z.object({
        channelId: z.string(),
        extension: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.prisma.extensionStatus.findUnique({
        select: { data: true },
        where: {
          channelId_extension: {
            channelId: input.channelId,
            extension: input.extension,
          },
        },
      });

      return res ? extensionStatusDataSchema.parse(parse(res.data)) : null;
    }),

  updateExtensionStatus: permittedProcedure
    .input(
      z.object({
        channelId: z.string(),
        extension: z.string(),
        data: extensionStatusDataSchema.transform((input) => stringify(input)),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.extensionStatus.upsert({
        where: {
          channelId_extension: {
            channelId: input.channelId,
            extension: input.extension,
          },
        },
        update: {
          data: input.data,
        },
        create: {
          channelId: input.channelId,
          extension: input.extension,
          data: input.data,
        },
      })
    ),
});
