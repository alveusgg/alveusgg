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
import { getSentryConfig } from "../utils/sentry";
import { createRetryingInitializer } from "../utils/initialization";

// Continue an unfinished Neon catch-up soon, rather than at the next hourly
// cron. Each alarm invocation gets a fresh subrequest budget.
const NEON_SYNC_CONTINUE_DELAY_MS = 60_000;

type DonationProviders = Partial<
  Omit<Record<Providers, () => Promise<DonationProvider | undefined>>, "neon">
> & {
  neon: () => Promise<NeonDonationProvider | undefined>;
};

function reportInitializationError(provider: Providers, operation: string) {
  return (error: unknown) => {
    console.error(`Failed ${operation} for ${provider}`, error);
    Sentry.withScope((scope) => {
      scope.setTag("integration", provider === "neon" ? "neon-crm" : provider);
      scope.setTag("error.kind", operation);
      Sentry.captureException(error);
    });
  };
}

class DonationsManagerDurableObjectBase extends DurableObject<Env> {
  private router: Hono;
  private providers?: DonationProviders;
  private ready?: Promise<void>;
  private reconcileTwitchSubscriptions?: () => Promise<true | undefined>;
  private registerNeonWebhook?: () => Promise<true | undefined>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    if (!env.SHARED_KEY) {
      throw new Error("SHARED_KEY must be defined in environment variables");
    }

    const sharedKeyMiddleware = createSharedKeyMiddleware(env.SHARED_KEY);

    this.router = new Hono()
      .use(logger())
      .use(setSentryTagsMiddleware())
      .use(async (c, next) => {
        await this.ensureReady();
        // Retry failed providers on later traffic, including the scheduled sync.
        // Healthy providers are cached and never wait for these background tasks.
        for (const initialize of Object.values(this.providers ?? {})) {
          this.ctx.waitUntil(initialize());
        }
        if (this.reconcileTwitchSubscriptions) {
          this.ctx.waitUntil(this.reconcileTwitchSubscriptions());
        }
        if (this.registerNeonWebhook) {
          this.ctx.waitUntil(this.registerNeonWebhook());
        }
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

        const result = await this.syncNeon();
        if (!result) {
          return new Response("Provider temporarily unavailable", {
            status: 503,
            headers: { "Retry-After": "60" },
          });
        }

        return c.json(result);
      })
      .post("/:providerId/live", async (c) => {
        if (!this.providers) {
          throw new Error(
            "This should be impossible. Init is called in prior middleware.",
          );
        }

        const providerId = Providers.safeParse(c.req.param("providerId"));
        if (!providerId.success) {
          return new Response("Invalid provider ID", { status: 400 });
        }

        const initialize = this.providers[providerId.data];
        if (!initialize) {
          return new Response("Provider not found", { status: 404 });
        }
        const provider = await initialize();
        if (!provider) {
          return new Response("Provider temporarily unavailable", {
            status: 503,
            headers: { "Retry-After": "60" },
          });
        }

        return provider.handle(c.req.raw);
      });
  }

  private ensureReady() {
    this.ready ??= this.init().catch((error: unknown) => {
      this.ready = undefined;
      throw error;
    });
    return this.ready;
  }

  private async syncNeon() {
    const provider = await this.providers?.neon();
    if (!provider) return undefined;

    const result = await provider.syncRecentDonations();
    if (!result.complete) {
      await this.ctx.storage.setAlarm(Date.now() + NEON_SYNC_CONTINUE_DELAY_MS);
    } else {
      await provider.removeFailedDonations();
    }
    return result;
  }

  async alarm() {
    await this.ensureReady();
    // Throwing lets Cloudflare retry the alarm; the hourly cron resumes after.
    if (!(await this.syncNeon())) {
      throw new Error("Neon provider unavailable for continued sync");
    }
  }

  async init() {
    await createIfNotExistsDonationsTable(this.ctx.storage.sql);
    await createIfNotExistsProviderMetadataTable(this.ctx.storage.sql);

    const storage = new DurableObjectDonationStorage(this.ctx, this.env);

    this.providers = {
      twitch: createRetryingInitializer(
        async () => {
          const provider = await TwitchDonationProvider.init(storage, this.env);
          this.reconcileTwitchSubscriptions = createRetryingInitializer(
            async () => {
              await provider.registerWebhook(this.env);
              return true as const;
            },
            reportInitializationError("twitch", "webhook-reconciliation"),
            60_000,
            5 * 60_000,
          );
          // Never hold callback verification or delivery open during setup.
          // The hourly sync also triggers this check if Twitch goes silent.
          this.ctx.waitUntil(this.reconcileTwitchSubscriptions());
          return provider;
        },
        reportInitializationError("twitch", "provider-initialization"),
      ),
      paypal: createRetryingInitializer(
        () => PaypalDonationProvider.init(storage, this.env),
        reportInitializationError("paypal", "provider-initialization"),
      ),
      neon: createRetryingInitializer(
        async () => {
          const provider = await NeonDonationProvider.init(storage, this.env);
          this.registerNeonWebhook = createRetryingInitializer(
            async () => {
              await provider.registerWebhook(
                `${this.env.SELF_URL}/donations/neon/live`,
              );
              return true as const;
            },
            reportInitializationError("neon", "webhook-registration"),
          );
          this.ctx.waitUntil(this.registerNeonWebhook());
          return provider;
        },
        reportInitializationError("neon", "provider-initialization"),
      ),
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
