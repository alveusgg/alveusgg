import { createHmac } from "node:crypto";
import { Readable } from "node:stream";

import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { handleTwitchModerationWebhook } from "@/server/twitch/moderation-webhook";

import moderationWebhook, { config } from "@/pages/api/twitch/moderation";

const { invalidate, secret } = vi.hoisted(() => ({
  invalidate: vi.fn(),
  secret: "local-eventsub-test-secret-0123456789",
}));
vi.mock("@/env", () => ({ env: { TWITCH_MODERATION_WEBHOOK_SECRET: secret } }));
vi.mock("@/server/utils/twitch-bans", () => ({
  invalidateTwitchBan: invalidate,
}));

const now = Date.parse("2026-10-16T10:00:00Z");
function payload(type = "channel.ban") {
  return {
    subscription: {
      type,
      version: "1",
      condition: { broadcaster_user_id: "636587384" },
    },
    event: {
      user_id: "123",
      broadcaster_user_id: "636587384",
      reason: "private moderation reason",
      ...(type === "channel.ban" ? { ends_at: null, is_permanent: true } : {}),
    },
  };
}
function signed(
  body: unknown = payload(),
  options: {
    messageType?: string;
    timestamp?: string;
    raw?: string;
    subscriptionType?: string;
  } = {},
) {
  const raw = options.raw ?? JSON.stringify(body);
  const timestamp = options.timestamp ?? new Date(now).toISOString();
  const id = "test-event-message-id";
  const signature = createHmac("sha256", secret)
    .update(id)
    .update(timestamp)
    .update(raw)
    .digest("hex");
  return new Request("https://website.test/api/twitch/moderation", {
    method: "POST",
    body: raw,
    headers: {
      "twitch-eventsub-message-id": id,
      "twitch-eventsub-message-timestamp": timestamp,
      "twitch-eventsub-message-signature": `sha256=${signature}`,
      "twitch-eventsub-message-type": options.messageType ?? "notification",
      "twitch-eventsub-subscription-type":
        options.subscriptionType ??
        (body as ReturnType<typeof payload>).subscription?.type ??
        "channel.ban",
      "twitch-eventsub-subscription-version": "1",
    },
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(now);
  invalidate.mockResolvedValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test.each([
  ["channel.ban", { endsAt: null }],
  ["channel.unban", undefined],
])(
  "authenticated %s events invalidate the exact Twitch user without copying moderation details",
  async (type, ban) => {
    const response = await handleTwitchModerationWebhook(
      signed(payload(type)),
      secret,
    );
    expect(response.status).toBe(204);
    expect(invalidate).toHaveBeenCalledExactlyOnceWith("123", ban);
    expect(await response.text()).toBe("");
  },
);

test("a timeout passes its end time on so the ban applies only until then", async () => {
  // Twitch sends sub-millisecond precision.
  const endsAt = "2026-10-16T10:10:00.12345678Z";
  const body = payload();
  Object.assign(body.event, { ends_at: endsAt, is_permanent: false });
  expect(
    (await handleTwitchModerationWebhook(signed(body), secret)).status,
  ).toBe(204);
  expect(invalidate).toHaveBeenCalledExactlyOnceWith("123", { endsAt });
});

test("the signature covers the exact delivered bytes, including a byte order mark", async () => {
  const response = await handleTwitchModerationWebhook(
    signed(payload(), { raw: `\uFEFF${JSON.stringify(payload())}` }),
    secret,
  );
  expect(response.status).toBe(204);
  expect(invalidate).toHaveBeenCalledOnce();
});

test("signed subscription verification returns the exact plaintext challenge without mutating Redis", async () => {
  const body = {
    subscription: payload().subscription,
    challenge: "test-verification-challenge",
  };
  const response = await handleTwitchModerationWebhook(
    signed(body, { messageType: "webhook_callback_verification" }),
    secret,
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("Content-Type")).toBe("text/plain");
  expect(await response.text()).toBe(body.challenge);
  expect(invalidate).not.toHaveBeenCalled();
});

test.each(["sha256=bad", `sha256=${"0".repeat(64)}`, ""])(
  "forged or missing signatures cannot invalidate authorization data: %s",
  async (signature) => {
    const request = signed();
    request.headers.set("twitch-eventsub-message-signature", signature);
    expect((await handleTwitchModerationWebhook(request, secret)).status).toBe(
      403,
    );
    expect(invalidate).not.toHaveBeenCalled();
  },
);

test("signature verification uses the untouched request bytes before JSON parsing", async () => {
  const original = signed();
  const altered = new Request(original.url, {
    method: "POST",
    headers: original.headers,
    body: JSON.stringify({ ...payload(), extra: true }),
  });
  expect((await handleTwitchModerationWebhook(altered, secret)).status).toBe(
    403,
  );
  expect(invalidate).not.toHaveBeenCalled();
});

test.each([now - 600_001, now + 60_001])(
  "signed messages outside the freshness window are rejected: %i",
  async (timestamp) => {
    expect(
      (
        await handleTwitchModerationWebhook(
          signed(payload(), { timestamp: new Date(timestamp).toISOString() }),
          secret,
        )
      ).status,
    ).toBe(403);
    expect(invalidate).not.toHaveBeenCalled();
  },
);

test.each([
  {
    ...payload(),
    subscription: {
      ...payload().subscription,
      condition: { broadcaster_user_id: "another-channel" },
    },
  },
  {
    ...payload(),
    event: { ...payload().event, broadcaster_user_id: "another-channel" },
  },
  { ...payload(), event: { ...payload().event, user_id: "invalid" } },
  {
    ...payload(),
    subscription: { ...payload().subscription, type: "channel.subscribe" },
  },
  { ...payload(), subscription: { ...payload().subscription, version: "2" } },
])(
  "unsupported channels, identities and subscription types cannot alter the cache: %j",
  async (body) => {
    expect(
      (await handleTwitchModerationWebhook(signed(body), secret)).status,
    ).toBe(400);
    expect(invalidate).not.toHaveBeenCalled();
  },
);

test("mismatched subscription headers are rejected even when the body is signed", async () => {
  expect(
    (
      await handleTwitchModerationWebhook(
        signed(payload(), { subscriptionType: "channel.unban" }),
        secret,
      )
    ).status,
  ).toBe(400);
  expect(invalidate).not.toHaveBeenCalled();
});

test("malformed JSON returns a bounded error without echoing payloads", async () => {
  const response = await handleTwitchModerationWebhook(
    signed(payload(), { raw: "{private-invalid-body" }),
    secret,
  );
  expect(response.status).toBe(400);
  expect(await response.text()).not.toContain("private-invalid-body");
});

test("a failed Redis write is not acknowledged so Twitch can retry delivery", async () => {
  invalidate.mockRejectedValue(new Error("private Redis connection string"));
  const response = await handleTwitchModerationWebhook(signed(), secret);
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private Redis");
});

test("duplicate notifications safely invalidate again without interpreting an old unban as an allow", async () => {
  const request = signed(payload("channel.unban"));
  expect(
    (await handleTwitchModerationWebhook(request.clone(), secret)).status,
  ).toBe(204);
  expect((await handleTwitchModerationWebhook(request, secret)).status).toBe(
    204,
  );
  expect(invalidate).toHaveBeenCalledTimes(2);
});

test("revocations are observable and preserve the bounded lookup fallback", async () => {
  const response = await handleTwitchModerationWebhook(
    signed(
      { subscription: payload().subscription },
      { messageType: "revocation" },
    ),
    secret,
  );
  expect(response.status).toBe(204);
  expect(console.warn).toHaveBeenCalled();
  expect(invalidate).not.toHaveBeenCalled();
});

test("missing webhook configuration cannot accept events", async () => {
  expect(
    (await handleTwitchModerationWebhook(signed(), undefined)).status,
  ).toBe(503);
  expect(invalidate).not.toHaveBeenCalled();
});

test("oversized notifications are rejected before cache mutation", async () => {
  const body = { ...payload(), padding: "x".repeat(65_536) };
  expect(
    (await handleTwitchModerationWebhook(signed(body), secret)).status,
  ).toBe(413);
  expect(invalidate).not.toHaveBeenCalled();
});

test("the Next API adapter preserves raw signed bytes and never caches a webhook response", async () => {
  expect(config.api.bodyParser).toBe(false);
  const request = signed();
  const req = Object.assign(
    Readable.from([Buffer.from(await request.text())]),
    { method: "POST", headers: Object.fromEntries(request.headers.entries()) },
  );
  const res = { setHeader: vi.fn(), status: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  await moderationWebhook(
    req as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
  expect(invalidate).toHaveBeenCalledExactlyOnceWith("123", { endsAt: null });
});

test.each([
  [
    "an oversized body",
    () => Readable.from([Buffer.from("x".repeat(65 * 1024))]),
    413,
  ],
  [
    "an interrupted delivery",
    () =>
      new Readable({
        read() {
          this.destroy(new Error("socket hang up"));
        },
      }),
    400,
  ],
])("the Next API adapter reports %s accurately", async (_, stream, status) => {
  const req = Object.assign(stream(), { method: "POST", headers: {} });
  const res = { setHeader: vi.fn(), status: vi.fn(), send: vi.fn() };
  res.status.mockReturnValue(res);
  await moderationWebhook(
    req as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );
  expect(res.status).toHaveBeenCalledWith(status);
  expect(invalidate).not.toHaveBeenCalled();
});
