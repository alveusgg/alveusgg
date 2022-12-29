import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { knownPushServicesRegex } from "../../../../utils/web-push";
import { getNotificationsConfig } from "../../../../config/notifications";

const baseRegistrationSchema = z.object({
  endpoint: z.string().regex(knownPushServicesRegex),
  p256dh: z.string().optional(),
  auth: z.string().optional(),
});

const selectionSchema = z.object({
  endpoint: z.string().regex(knownPushServicesRegex),
});

const tagsSchema = selectionSchema.and(
  z.object({
    tags: z.record(z.string(), z.string()),
  })
);

export const pushSubscriptionRouter = router({
  getStatus: publicProcedure
    .input(selectionSchema)
    .query(async ({ ctx, input }) =>
      prisma?.pushSubscription.findFirst({
        select: {
          tags: true,
          userId: true,
        },
        where: {
          userId: ctx.session?.user?.id,
          endpoint: input.endpoint,
        },
      })
    ),

  register: publicProcedure
    .input(baseRegistrationSchema)
    .mutation(async ({ ctx, input }) => {
      const exists = await prisma?.pushSubscription.findFirst({
        where: { endpoint: input.endpoint },
      });

      if (exists) {
        await prisma?.pushSubscription.update({
          where: { endpoint: input.endpoint },
          data: {
            userId: ctx.session?.user?.id,
            p256dh: input.p256dh,
            auth: input.auth,
          },
        });
      } else {
        const config = await getNotificationsConfig();
        await prisma?.pushSubscription.create({
          data: {
            endpoint: input.endpoint,
            userId: ctx.session?.user?.id,
            p256dh: input.p256dh,
            auth: input.auth,
            tags: {
              createMany: {
                data: Object.entries(config.defaultTags).map(
                  ([name, value]) => ({
                    name,
                    value,
                  })
                ),
              },
            },
          },
        });
      }
    }),

  setTags: publicProcedure
    .input(tagsSchema)
    .mutation(async ({ ctx, input }) => {
      await prisma?.pushSubscription.update({
        where: { endpoint: input.endpoint },
        data: {
          tags: {
            // delete only tag values for the tags in input if they already exist
            deleteMany: {
              name: { in: Object.keys(input.tags) },
            },
            createMany: {
              data: Object.entries(input.tags).map(([name, value]) => ({
                name,
                value,
              })),
            },
          },
        },
      });
    }),

  unregister: publicProcedure
    .input(selectionSchema)
    .mutation(async ({ input }) => {
      await prisma?.pushSubscription.delete({
        where: { endpoint: input.endpoint },
      });
    }),

  updateRegistration: publicProcedure
    .input(
      selectionSchema.and(z.object({ newSubscription: baseRegistrationSchema }))
    )
    .mutation(async ({ input }) => {
      await prisma?.pushSubscription.update({
        where: { endpoint: input.endpoint },
        data: input.newSubscription,
      });
    }),
});
