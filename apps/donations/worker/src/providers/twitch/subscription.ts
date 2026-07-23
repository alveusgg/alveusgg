import type { AppRouter } from "@alveusgg/alveusgg-website";
import type {
  Providers,
  TwitchSubscriptionDonation,
} from "@alveusgg/donations-core";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import superjson from "superjson";
import type { DonationProvider } from "..";
import type { DonationStorage } from "../storage";
import {
  TwitchEventHubMessageTypeHeader,
  TwitchEventHubMessageIdHeader,
  TwitchEventHubMessageTimestampHeader,
} from "./const";
import { verifySignature } from "./crypto";
import {
  TwitchChallengePayload,
  TwitchSubscriptionNotificationPayload,
} from "./schema";
import type { TwitchDonationProviderConfig } from "./twitch";

const subscriptionType = (type: string) => {
  if (type === "channel.subscription.gift") return "gift";
  if (type === "channel.subscription.message") return "resubscription";
  return "subscription";
};

export class TwitchSubscriptionDonationProvider implements DonationProvider {
  name: Providers = "twitchsubscription";
  constructor(
    private config: TwitchDonationProviderConfig,
    private service: DonationStorage,
  ) {}

  static async init(
    service: DonationStorage,
    env: Env,
  ): Promise<TwitchSubscriptionDonationProvider> {
    const config =
      await service.config.get<TwitchDonationProviderConfig>(
        "twitchsubscription",
      );
    if (!config) {
      const headers: Record<string, string> = {};
      if (env.OPTIONAL_VERCEL_PROTECTION_BYPASS) {
        headers["x-vercel-protection-bypass"] =
          env.OPTIONAL_VERCEL_PROTECTION_BYPASS;
      }

      if (!env.SHARED_KEY) {
        throw new Error("SHARED_KEY must be defined in environment variables");
      }

      if (!env.TWITCH_SUBSCRIPTION_SECRET) {
        throw new Error(
          "TWITCH_SUBSCRIPTION_SECRET must be defined in environment variables",
        );
      }

      await setupTwitchSubscription(
        env.SITE_URL!,
        env.SELF_URL!,
        env.SHARED_KEY,
        env.TWITCH_SUBSCRIPTION_SECRET,
        headers,
      );

      const config = {
        secret: env.TWITCH_SUBSCRIPTION_SECRET,
      } as const satisfies TwitchDonationProviderConfig;
      await service.config.set("twitchsubscription", config);

      return new TwitchSubscriptionDonationProvider(config, service);
    }
    return new TwitchSubscriptionDonationProvider(config, service);
  }

  async clear() {
    await this.service.config.set("twitchsubscription", undefined);
  }

  async handle(request: Request): Promise<Response> {
    if (!(await verifySignature(request, this.config.secret))) {
      return new Response(
        "This request was not signed by Twitch for this subscription.",
        {
          status: 401,
        },
      );
    }

    // Handle verification
    const body = await request.json();
    const type = request.headers.get(TwitchEventHubMessageTypeHeader);
    if (type === "webhook_callback_verification") {
      const payload = TwitchChallengePayload.safeParse(body);

      if (!payload.success) {
        return new Response(
          `The challenge payload was unexpected: ${payload.error.message}`,
          {
            status: 400,
          },
        );
      }

      return new Response(payload.data.challenge, {
        headers: { "Content-Type": "text/plain" },
        status: 200,
      });
    }

    if (type === "revocation") {
      await this.clear();
      return new Response(null, { status: 201 });
    }

    const uniqueMessageId = request.headers.get(TwitchEventHubMessageIdHeader);
    if (!uniqueMessageId) {
      await this.clear();
      return new Response(null, { status: 400 });
    }

    if (type === "notification") {
      const payload = TwitchSubscriptionNotificationPayload.safeParse(body);

      if (!payload.success) {
        return new Response(
          `The notification payload was unexpected: ${payload.error.message}`,
          {
            status: 400,
          },
        );
      }

      if (payload.data.event.is_gift) {
        // We do not want to store users who were gifted.
        // We store the original webhook event.
        return Response.json({ success: true }, { status: 201 });
      }

      const messageTimestamp = request.headers.get(
        TwitchEventHubMessageTimestampHeader,
      );

      const donation = {
        id: crypto.randomUUID(),
        provider: "twitchsubscription",
        providerUniqueId: uniqueMessageId,
        providerMetadata: {
          twitchDonatorId: payload.data.event.user_id,
          twitchDonatorDisplayName: payload.data.event.user_name,
          twitchBroadcasterId: payload.data.event.broadcaster_user_id,
          twitchSubscription: {
            type: subscriptionType(payload.data.subscription.type),
            cumulativeTotal: payload.data.event.cumulative_total,
            cumulativeMonths: payload.data.event.cumulative_months,
            durationMonths: payload.data.event.duration_months,
            isGift: payload.data.event.is_gift,
            isAnonymous: payload.data.event.is_anonymous,
            streakMonths: payload.data.event.streak_months,
            tier: payload.data.event.tier,
            total: payload.data.event.total,
          },
        },
        // Explicitly set amount to 0 because we have no way of determining the monetary
        // amount of any sub/resub/giftsub
        amount: 0,
        receivedAt: messageTimestamp ? new Date(messageTimestamp) : new Date(),
        donatedBy: {
          primary: "username",
          username: payload.data.event.user_login,
        },
        tags: {
          twitchBroadcasterId: payload.data.event.broadcaster_user_id,
        },
      } satisfies TwitchSubscriptionDonation;

      await this.service.add(donation);

      return Response.json({ success: true }, { status: 201 });
    }

    return new Response(`Unknown event type: ${type}`, {
      status: 400,
    });
  }
}

async function setupTwitchSubscription(
  url: string,
  selfUrl: string,
  token: string,
  secret: string,
  headers: Record<string, string> = {},
) {
  // Call out to the site API to setup the subscription
  const api = createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${url}/api/trpc`,
        transformer: superjson,
        headers: {
          Authorization: `ApiKey ${token}`,
          ...headers,
        },
      }),
    ],
  });

  await Promise.all([
    subscribeToWebhook(api, "channel.subscribe", selfUrl, secret),
    subscribeToWebhook(api, "channel.subscription.gift", selfUrl, secret),
    subscribeToWebhook(api, "channel.subscription.message", selfUrl, secret),
  ]);
}

async function subscribeToWebhook(
  api: ReturnType<typeof createTRPCProxyClient<AppRouter>>,
  type: string,
  selfUrl: string,
  secret: string,
) {
  await api.adminTwitch.setupWebhookSubscription.mutate({
    event: { type, version: "1" },
    url: `${selfUrl}/donations/twitchsubscription/live`,
    secret,
    alveusOnly: true,
  });
}
