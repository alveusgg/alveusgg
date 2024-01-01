import {
  type EmailContext,
  createOutgoingEmail,
  updateOutgoingEmail,
} from "@/server/db/outgoing-email";
import { callEndpoint } from "@/server/utils/queue";
import type { SendTemplateEmailOptions } from "@/server/utils/email";

import type { SendEmailEndpointOptions } from "@/pages/api/email/send";

export async function createEmail({
  type,
  email,
}: {
  type: EmailContext["type"];
  email: SendTemplateEmailOptions;
}) {
  const outgoingEmail = await createOutgoingEmail({
    provider: "resend",
    to: email.to,
    type,
    data: JSON.stringify({
      // TODO: What do we need to store here?
      subject: email.subject,
    }),
  });

  const res = await callEndpoint<SendEmailEndpointOptions>("/api/email/send", {
    id: outgoingEmail.id,
    email,
  });

  let success = true;
  if (res.status !== 200) {
    success = false;
    await updateOutgoingEmail(outgoingEmail.id, {
      failedAt: new Date(),
    });
  }

  return {
    success,
    email: outgoingEmail,
  };
}
