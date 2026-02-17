import type { AppRouter } from "@alveusgg/alveusgg-website";
import type { Donation } from "@alveusgg/donations-core";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { Hono } from "hono";
import { logger } from "hono/logger";
import superjson, { parse } from "superjson";
import * as Sentry from "@sentry/cloudflare";
import { forwardWithoutRoutePrefix } from "./utils/url";
import { getSentryConfig } from "./utils/sentry";
import { setSentryTagsMiddleware } from "./utils/middleware";

export { DonationsManagerDurableObject } from "./managers/donations";
export { PixelsManagerDurableObject } from "./managers/pixels";

const app = new Hono<{ Bindings: Env }>();
app.use(logger());

app.all("*", setSentryTagsMiddleware);

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

export default Sentry.withSentry<Env>(getSentryConfig, {
  fetch: app.fetch,
  // @ts-expect-error somewhere batch is getting typed as `MessageBatch<unknown>`
  // instead of `MessageBatch<string>`
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
    await api.donations.createDonations.mutate({ donations });

    const manager = env.PIXELS_MANAGER.getByName(`alveus-${env.MURAL_ID}`);
    await manager.process(donations);
  },
} satisfies ExportedHandler<Env, string>);
