import type { AppRouter } from "@alveusgg/alveusgg-website";
import type { Providers, TwitchDonation } from "@alveusgg/donations-core";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import superjson from "superjson";
import type { DonationProvider } from "..";
import type { DonationStorage } from "../storage";
import { TwitchEventHubMessageTypeHeader } from "./const";
import { verifySignature } from "./crypto";
import { TwitchChallengePayload, TwitchNotificationPayload } from "./schema";

interface TwitchDonationProviderConfig {
  secret: string;
}

interface TwitchDonationProviderOptions {
  sandbox: boolean;
  allowedCharityName: string;
}

export class TwitchDonationProvider implements DonationProvider {
  name: Providers = "twitch";
  constructor(
    private config: TwitchDonationProviderConfig,
    private options: TwitchDonationProviderOptions,
    private service: DonationStorage,
  ) {}

  static async init(
    service: DonationStorage,
    env: Env,
  ): Promise<TwitchDonationProvider> {
    const options = {
      sandbox: env.SANDBOX === "true",
      allowedCharityName: env.TWITCH_CHARITY_NAME,
    };
    const config =
      await service.config.get<TwitchDonationProviderConfig>("twitch");
    if (!config) {
      const headers: Record<string, string> = {};
      if (env.OPTIONAL_VERCEL_PROTECTION_BYPASS) {
        headers["x-vercel-protection-bypass"] =
          env.OPTIONAL_VERCEL_PROTECTION_BYPASS;
      }
      await setupTwitchSubscription(
        env.SITE_URL,
        env.SELF_URL,
        env.SHARED_KEY,
        env.TWITCH_SUBSCRIPTION_SECRET,
        headers,
      );

      const config = {
        secret: env.TWITCH_SUBSCRIPTION_SECRET,
      };
      await service.config.set("twitch", config);

      return new TwitchDonationProvider(config, options, service);
    }
    return new TwitchDonationProvider(config, options, service);
  }

  async clear() {
    await this.service.config.set("twitch", undefined);
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

    if (type === "notification") {
      const payload = TwitchNotificationPayload.safeParse(body);

      if (!payload.success) {
        return new Response(
          `The notification payload was unexpected: ${payload.error.message}`,
          {
            status: 400,
          },
        );
      }

      if (payload.data.event.charity_name !== this.options.allowedCharityName) {
        // Only Alveus donations are supported. We ignore others.
        console.log(
          `Ignoring donation from ${payload.data.event.charity_name} because it is not the allowed charity name (${this.options.allowedCharityName}).`,
        );
        return Response.json({ success: true }, { status: 201 });
      }

      const donation = {
        id: crypto.randomUUID(),
        provider: "twitch",
        providerUniqueId: payload.data.event.id,
        providerMetadata: {
          twitchDonatorId: payload.data.event.user_id,
          twitchDonatorDisplayName: payload.data.event.user_name,
          twitchBroadcasterId: payload.data.event.broadcaster_user_id,
          twitchCharityCampaignId: payload.data.event.campaign_id,
        },
        amount: payload.data.event.amount.value,
        receivedAt: new Date(),
        donatedBy: {
          primary: "username",
          username: payload.data.event.user_login,
        },
        tags: {
          twitchBroadcasterId: payload.data.event.broadcaster_user_id,
          twitchCharityCampaignId: payload.data.event.campaign_id,
        },
      } satisfies TwitchDonation;

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

  await api.adminTwitch.setupWebhookSubscription.mutate({
    event: { type: "channel.charity_campaign.donate", version: "1" },
    url: `${selfUrl}/donations/twitch/live`,
    secret,
  });
}
