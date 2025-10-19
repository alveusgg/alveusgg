import type { AppRouter } from "@alveusgg/alveusgg-website";
import type { Donation } from "@alveusgg/donations-core";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { Hono } from "hono";
import { logger } from "hono/logger";
import superjson, { parse } from "superjson";
import { forwardWithoutRoutePrefix } from "./utils/url";

export { DonationsManagerDurableObject } from "./managers/donations";
export { PixelsManagerDurableObject } from "./managers/pixels";

const app = new Hono<{ Bindings: Env }>();
app.use(logger());

app.all("/donations/*", async (c) => {
  const manager = c.env.DONATIONS_MANAGER.getByName("alveus");
  const request = forwardWithoutRoutePrefix(c);
  return await manager.fetch(request);
});

app.all("/pixels/*", async (c) => {
  const manager = c.env.PIXELS_MANAGER.getByName("alveus");
  const request = forwardWithoutRoutePrefix(c);
  return await manager.fetch(request);
});

export default {
  fetch: app.fetch,
  queue: async (batch, env) => {
    const api = createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: `${env.SITE_URL}/api/trpc`,
          transformer: superjson,
          headers: {
            Authorization: `ApiKey ${env.SHARED_KEY}`,
            "x-vercel-protection-bypass": env.OPTIONAL_VERCEL_PROTECTION_BYPASS,
          },
        }),
      ],
    });

    const donations: Donation[] = batch.messages.map((message) =>
      parse(message.body),
    );
    await api.donations.createDonations.mutate({ donations });

    const manager = env.PIXELS_MANAGER.getByName("alveus");
    await manager.add(donations);
  },
} satisfies ExportedHandler<Env, string>;
