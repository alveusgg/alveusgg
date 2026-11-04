import { z } from "zod";

const endpoint = "https://api.twitch.tv/helix/eventsub/subscriptions";
const subscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  type: z.string(),
  version: z.string(),
  condition: z.object({ broadcaster_user_id: z.string().optional() }),
  transport: z.object({
    method: z.string(),
    callback: z.string().optional(),
  }),
});
const subscriptionsSchema = z.object({
  data: z.array(subscriptionSchema),
  pagination: z.object({ cursor: z.string().optional() }).optional(),
});

interface WebhookOptions {
  type: string;
  version: string;
  callback: string;
  secret: string;
}

function isActive(status: string) {
  return (
    status === "enabled" || status === "webhook_callback_verification_pending"
  );
}

// Only repair this callback/type/version/channel. Production and preview share
// an app, so a failed subscription at another callback must never be deleted.
export async function reconcileWebhookSubscription(
  headers: Record<string, string>,
  broadcasterUserId: string,
  options: WebhookOptions,
) {
  const request = (url: string, init?: RequestInit) =>
    fetch(url, {
      ...init,
      headers,
      signal: AbortSignal.timeout(10_000),
    });

  async function findSubscriptions() {
    const subscriptions: z.infer<typeof subscriptionSchema>[] = [];
    const seenCursors = new Set<string>();
    let cursor: string | undefined;
    do {
      const params = new URLSearchParams({ type: options.type });
      if (cursor) params.set("after", cursor);
      const response = await request(`${endpoint}?${params}`);
      if (response.status !== 200) {
        throw new Error(
          `Twitch EventSub list failed (HTTP ${response.status})`,
        );
      }
      const page = subscriptionsSchema.parse(await response.json());
      subscriptions.push(
        ...page.data.filter(
          (subscription) =>
            subscription.type === options.type &&
            subscription.version === options.version &&
            subscription.condition.broadcaster_user_id === broadcasterUserId &&
            subscription.transport.method === "webhook" &&
            subscription.transport.callback === options.callback,
        ),
      );
      cursor = page.pagination?.cursor;
      if (cursor) {
        if (seenCursors.has(cursor)) {
          throw new Error(
            "Twitch EventSub returned a repeated pagination cursor",
          );
        }
        seenCursors.add(cursor);
      }
    } while (cursor);
    return subscriptions;
  }

  const existing = await findSubscriptions();
  const active = existing.find((subscription) => isActive(subscription.status));
  if (active) return active;

  // Removed users and unsupported versions need intervention. Authorization
  // revocations can be recreated once the channel grants permission again;
  // Twitch returns 403 below while that permission is still missing.
  for (const subscription of existing) {
    if (
      subscription.status !== "notification_failures_exceeded" &&
      subscription.status !== "webhook_callback_verification_failed" &&
      subscription.status !== "authorization_revoked"
    ) {
      throw new Error(
        `Twitch EventSub requires intervention: ${subscription.status}; check channel authorization and subscription version`,
      );
    }
  }

  for (const subscription of existing) {
    const response = await request(
      `${endpoint}?${new URLSearchParams({ id: subscription.id })}`,
      { method: "DELETE" },
    );
    if (response.status !== 204 && response.status !== 404) {
      throw new Error(
        `Twitch EventSub delete failed (HTTP ${response.status})`,
      );
    }
  }

  const response = await request(endpoint, {
    method: "POST",
    body: JSON.stringify({
      type: options.type,
      version: options.version,
      condition: { broadcaster_user_id: broadcasterUserId },
      transport: {
        method: "webhook",
        callback: options.callback,
        secret: options.secret,
      },
    }),
  });

  if (response.status === 409) {
    // Another reconciler may have created it. A conflict alone is not proof
    // that the subscription exists at our callback or can deliver events.
    const active = (await findSubscriptions()).find((subscription) =>
      isActive(subscription.status),
    );
    if (active) return active;
    throw new Error(
      "Twitch EventSub conflict without an active matching webhook",
    );
  }
  if (response.status !== 202) {
    throw new Error(
      `Twitch EventSub create failed (HTTP ${response.status})${response.status === 403 ? "; channel must authorize the required scopes for this app" : ""}`,
    );
  }
  const created = subscriptionsSchema.parse(await response.json()).data;
  const subscription = created[0];
  if (created.length !== 1 || !subscription || !isActive(subscription.status)) {
    throw new Error("Twitch EventSub did not accept the webhook subscription");
  }
  return subscription;
}

export async function reconcileWebhookSubscriptions(
  headers: Record<string, string>,
  broadcasterUserIds: string[],
  options: WebhookOptions,
) {
  const results = await Promise.allSettled(
    broadcasterUserIds.map((id) =>
      reconcileWebhookSubscription(headers, id, options),
    ),
  );
  const failures = results.flatMap((result, index) =>
    result.status === "rejected"
      ? [
          `channel ${broadcasterUserIds[index]}: ${result.reason instanceof Error ? result.reason.message : "reconciliation failed"}`,
        ]
      : [],
  );
  if (failures.length) {
    throw new Error(
      `Twitch webhook reconciliation failed: ${failures.join("; ")}`,
    );
  }
  return results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );
}
