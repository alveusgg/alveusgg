import { Providers } from "@alveusgg/donations-core";
import { DurableObject } from "cloudflare:workers";

import * as Sentry from "@sentry/cloudflare";
import { Hono } from "hono";
import { logger } from "hono/logger";
import type { DonationProvider } from "../providers";
import { PaypalDonationProvider } from "../providers/paypal/paypal";
import { NeonDonationProvider } from "../providers/neon/neon";
import {
  createIfNotExistsDonationsTable,
  createIfNotExistsProviderMetadataTable,
  DurableObjectDonationStorage,
} from "../providers/storage";
import { TwitchDonationProvider } from "../providers/twitch/twitch";
import {
  createSharedKeyMiddleware,
  setSentryTagsMiddleware,
} from "../utils/middleware";
import { TwitchSubscriptionDonationProvider } from "../providers/twitch/subscription";
import { getSentryConfig } from "../utils/sentry";

type DonationProviders = Partial<
  Omit<Record<Providers, DonationProvider>, "neon"> & {
    neon: NeonDonationProvider;
  }
>;

class DonationsManagerDurableObjectBase extends DurableObject<Env> {
  private router: Hono;
  private providers?: DonationProviders;
  private ready?: Promise<void>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    const sharedKeyMiddleware = createSharedKeyMiddleware(env.SHARED_KEY);

    this.router = new Hono()
      .use(logger())
      .use(setSentryTagsMiddleware())
      .use(async (c, next) => {
        if (!this.ready) {
          this.ready = this.init();
        }
        await this.ready;
        return next();
      })
      .post("/:providerId/sync", sharedKeyMiddleware, async (c) => {
        if (!this.providers) {
          throw new Error(
            "This should be impossible. Init is called in prior middleware.",
          );
        }

        const providerId = Providers.safeParse(c.req.param("providerId"));
        if (!providerId.success) {
          return new Response("Invalid provider ID", { status: 400 });
        }

        if (providerId.data !== "neon") {
          return new Response("Provider does not support sync", {
            status: 404,
          });
        }

        const provider = this.providers.neon;
        if (!provider) {
          return new Response("Provider not found", { status: 404 });
        }

        return c.json(await provider.syncRecentDonations());
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

    const [
      twitchSubscriptionProvider,
      twitchProvider,
      paypalProvider,
      neonProvider,
    ] = await Promise.all([
      TwitchSubscriptionDonationProvider.init(storage, this.env),
      TwitchDonationProvider.init(storage, this.env),
      PaypalDonationProvider.init(storage, this.env),
      NeonDonationProvider.init(storage, this.env),
    ]);

    this.providers = {
      twitchsubscription: twitchSubscriptionProvider,
      twitch: twitchProvider,
      paypal: paypalProvider,
      neon: neonProvider,
    };
  }

  fetch(request: Request): Response | Promise<Response> {
    return this.router.fetch(request);
  }
}

export const DonationsManagerDurableObject =
  Sentry.instrumentDurableObjectWithSentry(
    getSentryConfig,
    DonationsManagerDurableObjectBase,
  );
