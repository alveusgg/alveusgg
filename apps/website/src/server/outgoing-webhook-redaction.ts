// Webhook types with a body containing personal data, which is only kept until the webhook
// is delivered, or at most `REDACT_UNDELIVERED_AFTER_DAYS` days if it never is
export const REDACTED_TYPES = ["form-entry"];
export const REDACT_UNDELIVERED_AFTER_DAYS = 30;

/** The body to keep for a delivered webhook, or undefined to keep the original */
export function getRedactedOutgoingWebhookBody(type: string) {
  if (!REDACTED_TYPES.includes(type)) return undefined;
  return JSON.stringify({ type, redacted: true });
}

/** Whether a webhook's body was redacted (sending it again would only send the placeholder) */
export function isRedactedOutgoingWebhookBody(type: string, body: string) {
  return body === getRedactedOutgoingWebhookBody(type);
}

/** Webhooks created before this date have their body redacted, delivered or not */
export function getRedactUndeliveredBefore(now = new Date()) {
  return new Date(
    now.getTime() - REDACT_UNDELIVERED_AFTER_DAYS * 24 * 60 * 60 * 1000,
  );
}
