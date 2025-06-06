import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { getUserFollowsBroadcaster } from "@/server/apis/twitch";
import { createEntry, formEntrySchema } from "@/server/db/forms";
import {
  type OutgoingWebhookType,
  triggerOutgoingWebhook,
} from "@/server/outgoing-webhooks";
import { protectedProcedure, router } from "@/server/trpc/trpc";
import { getUserTwitchAccount } from "@/server/utils/auth";

import { channels } from "@/data/twitch";

import { calcFormConfig } from "@/utils/forms";

export const createFormEntrySchema = formEntrySchema.and(
  z.object({
    formId: z.string().cuid(),
    acceptRules: z.boolean().optional(),
    acceptPrivacy: z.boolean(),
  }),
);

export const formsRouter = router({
  enterForm: protectedProcedure
    .input(createFormEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Find form
      const form = await ctx.prisma.form.findUnique({
        where: {
          id: input.formId,
        },
      });

      const now = new Date();
      if (
        !form ||
        // Check form is still active:
        !form.active ||
        form.startAt > now ||
        (form.endAt && form.endAt < now)
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "form not found",
        });
      }

      if (input.acceptPrivacy !== true) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "consent for privacy policy not given",
        });
      }

      const config = calcFormConfig(form.config);
      if (config.hasRules && input.acceptRules !== true) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "rules not accepted",
        });
      }

      const userId = ctx.session.user.id;
      // Check use has not entered already
      const existingEntry = await ctx.prisma.formEntry.findUnique({
        select: {
          id: true,
        },
        where: {
          formId_userId: {
            formId: form.id,
            userId,
          },
        },
      });
      if (existingEntry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "entry already submitted",
        });
      }

      // Check if twitch account is connected
      const twitchAccount = await getUserTwitchAccount(userId, true);

      // Perform server side checks if required
      if (config.checks) {
        // TODO: Make the form config granular. Right now the channel follow check is hard-coded here:
        const isFollowing = await getUserFollowsBroadcaster(
          twitchAccount.token,
          twitchAccount.id,
          channels.alveus.id,
        );

        if (!isFollowing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Your connected Twitch account does not follow AlveusSanctuary!`,
          });
        }
      }

      // Insert entry
      const entry = await createEntry(userId, form.id, input, {
        withMailingAddress: config.requireShippingAddress,
      });

      if (form.outgoingWebhookUrl) {
        try {
          // Trigger webhook
          const webhook = await triggerOutgoingWebhook({
            url: form.outgoingWebhookUrl,
            type: "form-entry",
            userId,
            body: JSON.stringify({
              type: "form-entry" as OutgoingWebhookType,
              data: {
                id: entry.id,
                formId: form.id,
                username: entry.user.name,
                email: entry.user.email,
                createdAt: entry.createdAt,
              },
            }),
          });

          // connect the outgoing webhook to the entry
          await ctx.prisma.formEntry.update({
            where: { id: entry.id },
            data: {
              outgoingWebhook: { connect: { id: webhook.id } },
            },
          });
        } catch (_) {
          // ignore failed outgoing webhooks for now
        }
      }
    }),
});
