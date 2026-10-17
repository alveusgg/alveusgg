import type { Donation } from "@alveusgg/donations-core";
import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { parse } from "superjson";
import { setSentryTagsMiddleware } from "./utils/middleware";
import { getSentryConfig } from "./utils/sentry";
import { forwardWithoutRoutePrefix } from "./utils/url";
export { DonationsManagerDurableObject } from "./managers/donations";
export { PixelsManagerDurableObject } from "./managers/pixels";

const app = new Hono<{ Bindings: Env }>();
app.use(logger());
app.use(setSentryTagsMiddleware());

app.all("/donations/*", async (c) => {
  const manager = c.env.DONATIONS_MANAGER.getByName("alveus");
  const request = forwardWithoutRoutePrefix(c);
  return await manager.fetch(request);
});

app.all("/pixels/*", async (c) => {
  const manager = c.env.PIXELS_MANAGER.getByName(`alveus-${c.env.MURAL_ID}`);
  const request = forwardWithoutRoutePrefix(c);
  return await manager.fetch(request);
});

export default Sentry.withSentry<Env, string>(getSentryConfig, {
  fetch: app.fetch,
  scheduled: async (_, env) => {
    const manager = env.DONATIONS_MANAGER.getByName("alveus");
    const response = await manager.fetch("https://donations/neon/sync", {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${env.SHARED_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Neon donation sync failed with status ${response.status}: ${await response.text()}`,
      );
    }
  },
  queue: async (batch, env) => {
    const donations: Donation[] = batch.messages.map((message) =>
      parse(message.body),
    );
    // Delivery goes through the donations manager, so a donation cancelled
    // (e.g. after a failed payment) while queued is never written.
    const manager = env.DONATIONS_MANAGER.getByName("alveus");

    if (batch.queue.endsWith("donations")) {
      const delivered: Donation[] = await manager.deliverDonations(donations);
      const kept = new Set(delivered.map((donation) => donation.id));
      const messages = batch.messages.filter((message) =>
        kept.has(parse<Donation>(message.body).id),
      );
      if (messages.length) await env.PIXELS_QUEUE.sendBatch(messages);
      return;
    }

    if (batch.queue.endsWith("pixels")) {
      await manager.deliverPixels(donations);
      return;
    }

    throw new Error(`Unknown queue: ${batch.queue}`);
  },
} satisfies ExportedHandler<Env, string>);
