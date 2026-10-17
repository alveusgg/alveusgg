import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DonationStorage } from "../src/providers/storage";
import { createSignatureFromRequest } from "../src/providers/twitch/crypto";
import { TwitchDonationProvider } from "../src/providers/twitch/twitch";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@trpc/client", () => ({
  createTRPCProxyClient: () => ({
    adminTwitch: { setupWebhookSubscription: { mutate } },
  }),
  httpLink: vi.fn(),
}));
const service = {
  add: vi.fn(async () => 1),
  config: { get: vi.fn(), set: vi.fn() },
} satisfies DonationStorage;
const env = {
  TWITCH_SUBSCRIPTION_SECRET: "new-environment-secret",
  TWITCH_CHARITY_NAME: "Alveus Sanctuary",
  SITE_URL: "https://website.example.com",
  SELF_URL: "https://worker.example.com",
  SHARED_KEY: "shared-key",
} as Env;

async function signedRequest(type: string, body: unknown, secret: string) {
  const request = new Request(`${env.SELF_URL}/donations/twitch/live`, {
    method: "POST",
    headers: {
      "Twitch-Eventsub-Message-Type": type,
      "Twitch-Eventsub-Message-Id": "test-message",
      "Twitch-Eventsub-Message-Timestamp": new Date().toISOString(),
    },
    body: JSON.stringify(body),
  });
  request.headers.set(
    "Twitch-Eventsub-Message-Signature",
    await createSignatureFromRequest(request, secret),
  );
  return request;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("Twitch callback availability during reconciliation", () => {
  it("reuses the cached secret and checks subscriptions despite previously saved config", async () => {
    service.config.get.mockResolvedValue({ secret: "cached-signing-secret" });
    const provider = await TwitchDonationProvider.init(service, env);
    expect(mutate).not.toHaveBeenCalled();
    await provider.registerWebhook(env);

    expect(mutate).toHaveBeenCalledWith({
      event: { type: "channel.charity_campaign.donate", version: "1" },
      url: `${env.SELF_URL}/donations/twitch/live`,
      secret: "cached-signing-secret",
    });
    expect(service.config.set).not.toHaveBeenCalled();
  });

  it("persists a new secret and answers challenges while registration is pending", async () => {
    const provider = await TwitchDonationProvider.init(service, env);
    expect(service.config.set).toHaveBeenCalledWith("twitch", {
      secret: env.TWITCH_SUBSCRIPTION_SECRET,
    });
    expect(mutate).not.toHaveBeenCalled();
    mutate.mockReturnValue(new Promise(() => {}));
    void provider.registerWebhook(env);

    const response = await provider.handle(
      await signedRequest(
        "webhook_callback_verification",
        { challenge: "verification-challenge" },
        env.TWITCH_SUBSCRIPTION_SECRET!,
      ),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("verification-challenge");
    expect(service.add).not.toHaveBeenCalled();
  });

  it("keeps the shared secret after a signed revocation so other channels still verify", async () => {
    const secret = "cached-signing-secret";
    service.config.get.mockResolvedValue({ secret });
    const provider = await TwitchDonationProvider.init(service, env);
    const revoked = await provider.handle(
      await signedRequest(
        "revocation",
        {
          subscription: {
            id: "revoked-alveus",
            type: "channel.charity_campaign.donate",
            version: "1",
            status: "notification_failures_exceeded",
            condition: { broadcaster_user_id: "alveus" },
            transport: {
              method: "webhook",
              callback: `${env.SELF_URL}/donations/twitch/live`,
            },
          },
        },
        secret,
      ),
    );
    expect(revoked.status).toBe(201);
    expect(service.config.set).not.toHaveBeenCalled();
    const response = await provider.handle(
      await signedRequest(
        "webhook_callback_verification",
        { challenge: "maya-still-works" },
        secret,
      ),
    );
    expect(await response.text()).toBe("maya-still-works");
  });

  it("rejects an unsigned revocation", async () => {
    service.config.get.mockResolvedValue({ secret: "cached-signing-secret" });
    const provider = await TwitchDonationProvider.init(service, env);
    const response = await provider.handle(
      await signedRequest("revocation", {}, "wrong-secret"),
    );
    expect(response.status).toBe(401);
    expect(service.config.set).not.toHaveBeenCalled();
  });
});
