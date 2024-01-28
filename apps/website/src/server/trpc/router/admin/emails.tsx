import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { env } from "@/env/index.mjs";

import { permissions } from "@/config/permissions";

import {
  createCheckPermissionMiddleware,
  protectedProcedure,
  router,
} from "@/server/trpc/trpc";
import { sanitizeUserHtml } from "@/server/utils/sanitize-user-html";
import { emailToSchema } from "@/server/utils/email";
import { createEmail } from "@/server/email";

const baseUrl = env.NEXT_PUBLIC_BASE_URL;

const permittedProcedure = protectedProcedure.use(
  createCheckPermissionMiddleware(permissions.manageEmails),
);

export const adminEmailsRouter = router({
  sendTestEmail: permittedProcedure
    .input(
      z.object({
        to: emailToSchema,
        subject: z.string(),
        body: z.string(),
        preview: z.string().optional(),
      }),
    )
    .mutation(async ({ input: { to, subject, preview, body } }) => {
      const unsubscribeLink = `${baseUrl}/emails/unsubscribe`; // TODO: Implement actual unsubscribing
      const content = sanitizeUserHtml(body);
      const { success, email } = await createEmail({
        type: "admin",
        email: {
          to,
          subject,
          preview,
          unsubscribeLink,
          content,
        },
      });

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create email",
        });
      }

      return email.id;
    }),
});
