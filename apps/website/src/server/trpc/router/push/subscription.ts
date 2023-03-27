import { z } from "zod";
import { defaultTags } from "@/config/notifications";
import { knownPushServicesRegex } from "@/server/utils/web-push/known-push-services";
import { publicProcedure, router } from "@/server/trpc/trpc";

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
      ctx.prisma.pushSubscription.findFirst({
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
      const subscription = await ctx.prisma.pushSubscription.findFirst({
        where: { endpoint: input.endpoint },
        select: { id: true },
      });

      if (subscription) {
        await ctx.prisma.pushSubscription.update({
          where: { endpoint: input.endpoint },
          data: {
            userId: ctx.session?.user?.id,
            p256dh: input.p256dh,
            auth: input.auth,
          },
        });
      } else {
        await ctx.prisma.pushSubscription.create({
          data: {
            endpoint: input.endpoint,
            userId: ctx.session?.user?.id,
            p256dh: input.p256dh,
            auth: input.auth,
            tags: {
              createMany: {
                data: Object.entries(defaultTags).map(([name, value]) => ({
                  name,
                  value,
                })),
              },
            },
          },
        });
      }
    }),

  setTags: publicProcedure
    .input(tagsSchema)
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.pushSubscription.findFirst({
        where: { endpoint: input.endpoint },
        select: { id: true },
      });

      if (!subscription) {
        throw Error("Subscription does not exist!");
      }

      await ctx.prisma.pushSubscriptionTag.deleteMany({
        where: {
          subscriptionId: subscription.id,
          name: { in: Object.keys(input.tags) },
        },
      });

      await ctx.prisma.pushSubscriptionTag.createMany({
        data: Object.entries(input.tags).map(([name, value]) => ({
          subscriptionId: subscription.id,
          name,
          value,
        })),
        skipDuplicates: true,
      });
    }),

  unregister: publicProcedure
    .input(selectionSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.pushSubscription.delete({
        where: { endpoint: input.endpoint },
      });
    }),

  updateRegistration: publicProcedure
    .input(
      selectionSchema.and(z.object({ newSubscription: baseRegistrationSchema }))
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.pushSubscription.update({
        where: { endpoint: input.endpoint },
        data: input.newSubscription,
      });
    }),
});
