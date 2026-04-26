import type { AppRouter } from "@alveusgg/alveusgg-website";
import type { Donation } from "@alveusgg/donations-core";
import * as Sentry from "@sentry/cloudflare";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { Hono } from "hono";
import { logger } from "hono/logger";
import superjson, { parse } from "superjson";
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
  queue: async (batch, env) => {
    const headers: Record<string, string> = {};
    if (env.OPTIONAL_VERCEL_PROTECTION_BYPASS) {
      headers["x-vercel-protection-bypass"] =
        env.OPTIONAL_VERCEL_PROTECTION_BYPASS;
    }

    const api = createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: `${env.SITE_URL}/api/trpc`,
          transformer: superjson,
          headers: {
            Authorization: `ApiKey ${env.SHARED_KEY}`,
            ...headers,
          },
        }),
      ],
    });

    const donations: Donation[] = batch.messages.map((message) =>
      parse(message.body),
    );

    if (batch.queue === "alveus-donations") {
      await api.donations.createDonations.mutate({ donations });
      await env.PIXELS_QUEUE.sendBatch(batch.messages);
      return;
    }

    if (batch.queue === "alveus-pixels") {
      const manager = env.PIXELS_MANAGER.getByName(`alveus-${env.MURAL_ID}`);
      await manager.process(donations);
      return;
    }

    throw new Error(`Unknown queue: ${batch.queue}`);
  },
} satisfies ExportedHandler<Env, string>);
