import { z } from "zod";

import {
  sendTemplateEmail,
  sendTemplateEmailOptionsSchema,
} from "@/server/utils/email";
import { createTokenProtectedApiHandler } from "@/server/utils/api";
import {
  getOutgoingEmail,
  updateOutgoingEmail,
  updateOutgoingEmailHandedOver,
} from "@/server/db/outgoing-email";

export type SendEmailEndpointOptions = z.infer<typeof sendEmailEndpointSchema>;

const sendEmailEndpointSchema = z.object({
  id: z.string().cuid(),
  email: sendTemplateEmailOptionsSchema,
});

export default createTokenProtectedApiHandler(
  sendEmailEndpointSchema,
  async ({ id, email }) => {
    const outgoingEmail = await getOutgoingEmail(id);
    if (!outgoingEmail) {
      return false;
    }

    const res = await sendTemplateEmail(email);
    if (res.error || res.data === null) {
      await updateOutgoingEmail(id, { failedAt: new Date() });
      return false;
    }

    await updateOutgoingEmailHandedOver(id, res.data.id);

    return true;
  },
);
