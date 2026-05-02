import { Providers } from "@alveusgg/donations-core";
import { DurableObject } from "cloudflare:workers";

import * as Sentry from "@sentry/cloudflare";
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
import {
  createSharedKeyMiddleware,
  setSentryTagsMiddleware,
} from "../utils/middleware";
import { getSentryConfig } from "../utils/sentry";

class DonationsManagerDurableObjectBase extends DurableObject<Env> {
  private router: Hono;
  private providers?: Partial<Record<Providers, DonationProvider>>;
  private ready?: Promise<void>;
  private storage?: DurableObjectDonationStorage;

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
      .post("/resubscribe", sharedKeyMiddleware, async (c) => {
        try {
          await this.ctx.blockConcurrencyWhile(async () => {
            await this.resubscribe();
          });

          return c.json({ success: true });
        } catch (error) {
          console.error(error);
          Sentry.captureException(error);
          return c.json(
            {
              error: "Failed to resubscribe donations providers",
              success: false,
            },
            500,
          );
        }
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

    this.storage = new DurableObjectDonationStorage(
      this.ctx,
      this.env.DONATION_QUEUE,
    );

    await this.initProviders();
  }

  private async initProviders() {
    const storage = this.storage;
    if (!storage) {
      throw new Error("Donation storage not initialized");
    }

    const [twitchProvider, paypalProvider] = await Promise.all([
      TwitchDonationProvider.init(storage, this.env),
      PaypalDonationProvider.init(storage, this.env),
    ]);

    this.providers = {
      twitch: twitchProvider,
      paypal: paypalProvider,
    };
  }

  private async resubscribe() {
    const twitchProvider = this.providers?.twitch;
    if (twitchProvider instanceof TwitchDonationProvider) {
      await twitchProvider.clear();
    }

    await this.initProviders();
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
