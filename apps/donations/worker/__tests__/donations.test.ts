import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/cloudflare";
import { DonationsManagerDurableObject } from "../src/managers/donations";
import { NeonDonationProvider } from "../src/providers/neon/neon";
import { PaypalDonationProvider } from "../src/providers/paypal/paypal";
import { TwitchDonationProvider } from "../src/providers/twitch/twitch";
import { createIfNotExistsDonationsTable } from "../src/providers/storage";

vi.mock("@sentry/cloudflare", () => ({
  instrumentDurableObjectWithSentry: (_config: unknown, base: unknown) => base,
  captureException: vi.fn(),
  setTags: vi.fn(),
  withScope: (callback: (scope: { setTag: () => void }) => void) =>
    callback({ setTag: vi.fn() }),
}));
vi.mock("../src/providers/storage", () => ({
  createIfNotExistsDonationsTable: vi.fn().mockResolvedValue(undefined),
  createIfNotExistsProviderMetadataTable: vi.fn().mockResolvedValue(undefined),
  DurableObjectDonationStorage: class {},
}));
vi.mock("../src/providers/neon/neon", () => ({
  NeonDonationProvider: { init: vi.fn() },
}));
vi.mock("../src/providers/paypal/paypal", () => ({
  PaypalDonationProvider: { init: vi.fn() },
}));
vi.mock("../src/providers/twitch/twitch", () => ({
  TwitchDonationProvider: { init: vi.fn() },
}));

function makeProvider(name: string) {
  return {
    name,
    handle: vi.fn(
      async () => new Response(`${name} accepted`, { status: 201 }),
    ),
    registerWebhook: vi.fn(async () => {}),
    syncRecentDonations: vi.fn(async () => ({
      found: 0,
      imported: 0,
      skipped: 0,
    })),
  };
}

function makeManager() {
  const background: Promise<unknown>[] = [];
  const ctx = {
    storage: { sql: {} },
    waitUntil: (task: Promise<unknown>) => background.push(task),
  } as unknown as DurableObjectState;
  const env = {
    SELF_URL: "https://example.com",
    SHARED_KEY: "shared-key",
  } as Env;
  const manager = new DonationsManagerDurableObject(ctx, env);
  return {
    request: (provider: string, route = "live") =>
      manager.fetch(
        new Request(`https://donations/${provider}/${route}`, {
          method: "POST",
          headers: { Authorization: "ApiKey shared-key" },
        }),
      ),
    drain: () => Promise.all(background),
  };
}

const neon = makeProvider("neon");
const paypal = makeProvider("paypal");
const twitch = makeProvider("twitch");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  neon.registerWebhook.mockReset().mockResolvedValue(undefined);
  // Fake providers stand in for each external integration's initialization.
  vi.mocked(NeonDonationProvider.init)
    .mockReset()
    .mockResolvedValue(neon as unknown as NeonDonationProvider);
  vi.mocked(PaypalDonationProvider.init)
    .mockReset()
    .mockResolvedValue(paypal as unknown as PaypalDonationProvider);
  vi.mocked(TwitchDonationProvider.init)
    .mockReset()
    .mockResolvedValue(twitch as unknown as TwitchDonationProvider);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("donation provider isolation", () => {
  it("serves PayPal and Twitch when Neon initialization fails", async () => {
    const error = new Error("Neon configuration unavailable");
    vi.mocked(NeonDonationProvider.init).mockRejectedValue(error);
    const manager = makeManager();

    expect((await manager.request("paypal")).status).toBe(201);
    expect((await manager.request("twitch")).status).toBe(201);
    const failed = await manager.request("neon");
    expect(failed.status).toBe(503);
    expect(failed.headers.get("Retry-After")).toBe("60");
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(NeonDonationProvider.init).toHaveBeenCalledTimes(1);
  });

  it("does not wait for a stalled provider before serving another provider", async () => {
    vi.mocked(NeonDonationProvider.init).mockReturnValue(new Promise(() => {}));
    const manager = makeManager();

    expect((await manager.request("paypal")).status).toBe(201);
    expect((await manager.request("twitch")).status).toBe(201);
  });

  it("retries a failed provider after the cooldown and shares concurrent initialization", async () => {
    vi.mocked(TwitchDonationProvider.init)
      .mockRejectedValueOnce(new Error("Twitch unavailable"))
      .mockResolvedValue(twitch as unknown as TwitchDonationProvider);
    const manager = makeManager();

    expect((await manager.request("twitch")).status).toBe(503);
    expect((await manager.request("twitch")).status).toBe(503);
    expect(TwitchDonationProvider.init).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60_000);
    // Other traffic, including cron sync, must retry a failed provider even if
    // that provider has stopped sending events after a setup failure.
    expect((await manager.request("paypal")).status).toBe(201);
    await manager.drain();
    const responses = await Promise.all([
      manager.request("twitch"),
      manager.request("twitch"),
    ]);
    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(TwitchDonationProvider.init).toHaveBeenCalledTimes(2);
    expect(PaypalDonationProvider.init).toHaveBeenCalledTimes(1);
  });

  it("can recover from shared storage initialization failure on a later request", async () => {
    vi.mocked(createIfNotExistsDonationsTable).mockRejectedValueOnce(
      new Error("Temporary storage failure"),
    );
    const manager = makeManager();

    expect((await manager.request("paypal")).status).toBe(500);
    expect((await manager.request("paypal")).status).toBe(201);
    expect(createIfNotExistsDonationsTable).toHaveBeenCalledTimes(2);
  });

  it("keeps existing Neon callbacks and sync available after registration fails, then retries setup", async () => {
    const error = new Error("Neon webhook registration failed");
    neon.registerWebhook
      .mockRejectedValueOnce(error)
      .mockResolvedValue(undefined);
    const manager = makeManager();

    expect((await manager.request("neon")).status).toBe(201);
    await manager.drain();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect((await manager.request("neon", "sync")).status).toBe(200);
    expect(neon.registerWebhook).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60_000);
    expect((await manager.request("paypal")).status).toBe(201);
    await manager.drain();
    expect(neon.registerWebhook).toHaveBeenCalledTimes(2);
    expect(neon.registerWebhook).toHaveBeenCalledWith(
      "https://example.com/donations/neon/live",
    );
    expect((await manager.request("neon")).status).toBe(201);
    await manager.drain();
    expect(neon.registerWebhook).toHaveBeenCalledTimes(2);
  });

  it("does not wait for Neon registration before handling an existing callback", async () => {
    neon.registerWebhook.mockReturnValue(new Promise(() => {}));
    const manager = makeManager();

    expect((await manager.request("neon")).status).toBe(201);
    expect((await manager.request("paypal")).status).toBe(201);
  });

  it("does not acknowledge a failed donation delivery as successful", async () => {
    paypal.handle.mockRejectedValueOnce(
      new Error("Donation processing failed"),
    );
    const manager = makeManager();

    expect((await manager.request("paypal")).status).toBe(500);
    expect((await manager.request("twitch")).status).toBe(201);
  });
});
