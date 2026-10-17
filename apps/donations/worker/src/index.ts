import type { Donation } from "@alveusgg/donations-core";
import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { parse } from "superjson";
import { setSentryTagsMiddleware } from "./utils/middleware";
import { getSentryConfig } from "./utils/sentry";
import { createSiteApi } from "./utils/site-api";
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
    const api = createSiteApi(env);

    const parsed: Donation[] = batch.messages.map((message) =>
      parse(message.body),
    );
    // Donations can be cancelled (e.g. a failed payment) while still queued.
    const donations: Donation[] =
      await env.DONATIONS_MANAGER.getByName("alveus").filterCancelled(parsed);
    if (!donations.length) return;

    if (batch.queue.endsWith("donations")) {
      const kept = new Set(donations.map((donation) => donation.id));
      await api.donations.createDonations.mutate({ donations });
      await env.PIXELS_QUEUE.sendBatch(
        batch.messages.filter((message) =>
          kept.has(parse<Donation>(message.body).id),
        ),
      );
      return;
    }

    if (batch.queue.endsWith("pixels")) {
      const manager = env.PIXELS_MANAGER.getByName(`alveus-${env.MURAL_ID}`);
      await manager.process(donations);
      return;
    }

    throw new Error(`Unknown queue: ${batch.queue}`);
  },
} satisfies ExportedHandler<Env, string>);
