import { Providers } from "@alveusgg/donations-core";
import { DurableObject } from "cloudflare:workers";

import { Hono } from "hono";
import { logger } from "hono/logger";
import type { DonationProvider } from "../providers";
import { PaypalDonationProvider } from "../providers/paypal/paypal";
import {
  createIfNotExistsDonationsTable,
  createIfNotExistsProviderMetadataTable,
  DurableObjectDonationStorage,
} from "../providers/storage";
import { TwitchDonationProvider } from "../providers/twitch/twitch";

export class DonationsManagerDurableObject extends DurableObject<Env> {
  private router: Hono;
  private providers?: Partial<Record<Providers, DonationProvider>>;
  private ready?: Promise<void>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.router = new Hono()
      .use(logger())
      .use(async (c, next) => {
        if (!this.ready) {
          this.ready = this.init();
        }
        await this.ready;
        return next();
      })
      .post("/:providerId/live", (c) => {
        if (!this.providers) {
          throw new Error(
            "This should be impossible. Init is called in prior middleware.",
          );
        }

        const providerId = Providers.safeParse(c.req.param("providerId"));
        if (!providerId.success) {
          return new Response("Invalid provider ID", { status: 400 });
        }
        const provider = this.providers[providerId.data];

        if (!provider) {
          return new Response("Provider not found", { status: 404 });
        }

        return provider.handle(c.req.raw);
      });
  }

  async init() {
    await createIfNotExistsDonationsTable(this.ctx.storage.sql);
    await createIfNotExistsProviderMetadataTable(this.ctx.storage.sql);

    const storage = new DurableObjectDonationStorage(
      this.ctx,
      this.env.DONATION_QUEUE,
    );

    const [twitchProvider, paypalProvider] = await Promise.all([
      TwitchDonationProvider.init(storage, this.env),
      PaypalDonationProvider.init(storage, this.env),
    ]);

    this.providers = {
      twitch: twitchProvider,
      paypal: paypalProvider,
    };
  }

  fetch(request: Request): Response | Promise<Response> {
    return this.router.fetch(request);
  }
}
