import type { ReactElement, ReactNode } from "react";
import { z } from "zod";
import { Resend } from "resend";
import { render } from "@react-email/render";
import type { OutgoingEmail } from "@prisma/client";

import { env } from "@/env/index.mjs";

import type { OutgoingEmailUpdate } from "@/server/db/outgoing-email";
import {
  getOutgoingEmailByProviderId,
  updateOutgoingEmail,
} from "@/server/db/outgoing-email";

import { renderHtmlForEmail } from "@/utils/email";

import { EmailTemplate } from "@/components/email/template";

export type EmailTo = z.infer<typeof emailToSchema>;
export const emailToSchema = z.string().email();

const unsubscribeLinkSchema = z.string().url();

const sendEmailBaseSchema = z.object({
  to: emailToSchema,
  subject: z.string(),
  unsubscribeLink: unsubscribeLinkSchema.optional(),
});

export const sendTemplateEmailOptionsSchema = sendEmailBaseSchema.merge(
  z.object({
    content: z.string(),
    preview: z.string().optional(),
    unsubscribeLink: unsubscribeLinkSchema,
  }),
);

export type SendEmailOptions = z.infer<typeof sendEmailBaseSchema> & {
  text: string;
  react?: ReactElement | ReactNode | null;
  html?: string;
};

export type SendTemplateEmailOptions = z.infer<
  typeof sendTemplateEmailOptionsSchema
>;

type EmailState = (typeof emailStates)[number];

const emailStates = [
  "email.bounced",
  "email.complained",
  "email.delivered",
  "email.delivery_delayed",
  "email.sent",
] as const;

type WebhookData = z.infer<typeof webhookSchema>;

const webhookSchema = z.object({
  type: z.enum(emailStates),
  created_at: z.string().datetime(),
  data: z.object({
    created_at: z.string().datetime(),
    email_id: z.string(),
    from: z.string(),
    subject: z.string(),
    to: z.array(z.string()),
  }),
});

const webhookHandlers = {
  "email.bounced": async (_data: WebhookData) => {
    // TODO: Handle bounces by unsubscribing email address from topic if applicable
    return { bouncedAt: new Date() };
  },
  "email.complained": async (_data: WebhookData) => {
    // TODO: Handle complains by unsubscribing email address from topic if applicable
    return { bouncedAt: new Date() };
  },
  "email.delivered": async () => ({ deliveredAt: new Date() }),
  "email.delivery_delayed": async () => ({ delayedAt: new Date() }),
  "email.sent": async () => ({ sentAt: new Date() }),
} as const satisfies {
  [k in EmailState]: (
    data: WebhookData,
    outgoingEmail?: OutgoingEmail,
  ) => Promise<OutgoingEmailUpdate | null>;
};

export function parseWebhook(body: unknown) {
  return webhookSchema.safeParse(body);
}

export async function handleWebhook(data: WebhookData) {
  const outgoingEmail = await getOutgoingEmailByProviderId(
    "resend",
    data.data.email_id,
  );
  const update = await webhookHandlers[data.type](data);
  if (update && outgoingEmail) {
    await updateOutgoingEmail(outgoingEmail.id, update);
  }
}

export function sendEmail({ unsubscribeLink, ...props }: SendEmailOptions) {
  if (!emailToSchema.safeParse(props.to).success) {
    throw new Error("Invalid email");
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const headers: Record<string, string> = {};
  if (unsubscribeLink) {
    headers["List-Unsubscribe"] = `<${unsubscribeLink}>`;
  }

  return resend.emails.send({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`,
    headers,
    ...props,
  });
}

export function sendTemplateEmail({
  content,
  preview,
  unsubscribeLink,
  ...props
}: SendTemplateEmailOptions) {
  const body = renderHtmlForEmail(content);
  const react = (
    <EmailTemplate
      subject={props.subject}
      preview={preview}
      unsubscribeLink={unsubscribeLink}
    >
      {body}
    </EmailTemplate>
  );
  const text = render(react, { plainText: true });

  return sendEmail({
    ...props,
    text,
    react,
  });
}
