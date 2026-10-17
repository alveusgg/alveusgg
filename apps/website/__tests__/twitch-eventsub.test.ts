import { afterEach, describe, expect, it, vi } from "vitest";

import {
  reconcileWebhookSubscription,
  reconcileWebhookSubscriptions,
} from "@/server/apis/twitch-eventsub";

const options = {
  type: "channel.charity_campaign.donate",
  version: "1",
  callback: "https://donations.example.com/donations/twitch/live",
  secret: "existing-signing-secret",
};
const headers = { Authorization: "Bearer app-token" };
const subscription = {
  id: "existing",
  status: "enabled",
  type: options.type,
  version: options.version,
  condition: { broadcaster_user_id: "alveus" },
  transport: { method: "webhook", callback: options.callback },
};
const page = (data: unknown[], cursor?: string) =>
  Response.json({ data, pagination: cursor ? { cursor } : {} });
const reconcile = () =>
  reconcileWebhookSubscription(headers, "alveus", options);

afterEach(() => vi.unstubAllGlobals());

describe("Twitch EventSub reconciliation", () => {
  it.each(["enabled", "webhook_callback_verification_pending"])(
    "preserves an existing %s subscription without mutating it",
    async (status) => {
      const fetch = vi
        .fn()
        .mockResolvedValue(page([{ ...subscription, status }]));
      vi.stubGlobal("fetch", fetch);

      expect(await reconcile()).toEqual({ ...subscription, status });
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );

  it("checks all pages before deciding a subscription is missing", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page([], "next"))
      .mockResolvedValueOnce(page([subscription]));
    vi.stubGlobal("fetch", fetch);

    await reconcile();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1]?.[0]).toContain("after=next");
  });

  it("rejects a repeated cursor without making any mutations", async () => {
    const fetch = vi.fn().mockImplementation(async () => page([], "same"));
    vi.stubGlobal("fetch", fetch);

    await expect(reconcile()).rejects.toThrow("repeated pagination cursor");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    "notification_failures_exceeded",
    "webhook_callback_verification_failed",
    "authorization_revoked",
  ])(
    "replaces a %s subscription using the existing signing secret",
    async (status) => {
      const pending = {
        ...subscription,
        id: "replacement",
        status: "webhook_callback_verification_pending",
      };
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(page([{ ...subscription, status }]))
        .mockResolvedValueOnce(new Response(null, { status: 204 }))
        .mockResolvedValueOnce(
          Response.json({ data: [pending] }, { status: 202 }),
        );
      vi.stubGlobal("fetch", fetch);

      expect((await reconcile()).status).toBe(
        "webhook_callback_verification_pending",
      );
      expect(fetch.mock.calls[1]?.[0]).toContain("id=existing");
      expect(fetch.mock.calls[1]?.[1]).toMatchObject({ method: "DELETE" });
      expect(JSON.parse(fetch.mock.calls[2]?.[1].body)).toEqual({
        type: options.type,
        version: options.version,
        condition: { broadcaster_user_id: "alveus" },
        transport: {
          method: "webhook",
          callback: options.callback,
          secret: options.secret,
        },
      });
    },
  );

  it("preserves other callbacks, channels, event types and versions when creating a missing hook", async () => {
    const unrelated = [
      {
        ...subscription,
        id: "preview",
        status: "notification_failures_exceeded",
        transport: {
          method: "webhook",
          callback: "https://preview.example.com/live",
        },
      },
      {
        ...subscription,
        id: "maya",
        condition: { broadcaster_user_id: "maya" },
      },
      { ...subscription, id: "other-type", type: "channel.follow" },
      { ...subscription, id: "other-version", version: "2" },
      { ...subscription, id: "websocket", transport: { method: "websocket" } },
    ];
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page(unrelated))
      .mockResolvedValueOnce(
        Response.json({ data: [subscription] }, { status: 202 }),
      );
    vi.stubGlobal("fetch", fetch);

    await reconcile();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1]?.[1]).toMatchObject({ method: "POST" });
  });

  it.each(["version_removed", "user_removed", "unknown_status"])(
    "reports %s as requiring intervention without deleting the hook",
    async (status) => {
      const fetch = vi
        .fn()
        .mockResolvedValue(page([{ ...subscription, status }]));
      vi.stubGlobal("fetch", fetch);

      await expect(reconcile()).rejects.toThrow(
        `requires intervention: ${status}`,
      );
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );

  it("surfaces missing channel permissions instead of accepting setup as successful", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));
    vi.stubGlobal("fetch", fetch);

    await expect(reconcile()).rejects.toThrow("channel must authorize");
  });

  it("recovers on a later check once a channel reauthorizes", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        page([{ ...subscription, status: "authorization_revoked" }]),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(
        Response.json({ data: [subscription] }, { status: 202 }),
      );
    vi.stubGlobal("fetch", fetch);

    await expect(reconcile()).rejects.toThrow("channel must authorize");
    // Reauthorization is performed by the channel owner; the next check can
    // recreate the missing subscription without an operator resetting config.
    await expect(reconcile()).resolves.toMatchObject({ status: "enabled" });
    expect(fetch).toHaveBeenCalledTimes(5);
  });

  it("rejects malformed list data instead of assuming the hook is missing", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(Response.json({ data: [{ id: "broken" }] }));
    vi.stubGlobal("fetch", fetch);

    await expect(reconcile()).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not create anything after a failed list or delete", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetch);
    await expect(reconcile()).rejects.toThrow("list failed");
    expect(fetch).toHaveBeenCalledTimes(1);

    fetch
      .mockReset()
      .mockResolvedValueOnce(
        page([{ ...subscription, status: "notification_failures_exceeded" }]),
      )
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    await expect(reconcile()).rejects.toThrow("delete failed");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([true, false])(
    "rechecks a 409 conflict and accepts it only if our active hook exists (exists=%s)",
    async (exists) => {
      const fetch = vi
        .fn()
        .mockResolvedValueOnce(page([]))
        .mockResolvedValueOnce(new Response(null, { status: 409 }))
        .mockResolvedValueOnce(page(exists ? [subscription] : []));
      vi.stubGlobal("fetch", fetch);

      if (exists)
        await expect(reconcile()).resolves.toMatchObject({ status: "enabled" });
      else
        await expect(reconcile()).rejects.toThrow(
          "conflict without an active matching webhook",
        );
      expect(fetch).toHaveBeenCalledTimes(3);
    },
  );

  it("still reconciles healthy channels when another channel fails", async () => {
    const maya = {
      ...subscription,
      id: "maya",
      condition: { broadcaster_user_id: "maya" },
    };
    const fetch = vi
      .fn()
      .mockImplementation(async (_url, init: RequestInit) =>
        init.method === "POST"
          ? new Response(null, { status: 403 })
          : page([maya]),
      );
    vi.stubGlobal("fetch", fetch);

    await expect(
      reconcileWebhookSubscriptions(headers, ["alveus", "maya"], options),
    ).rejects.toThrow("channel alveus: Twitch EventSub create failed");
    // Maya's existing hook is kept; Alveus' failure reaches the caller.
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(
      fetch.mock.calls.filter(([, init]) => init.method === "DELETE"),
    ).toHaveLength(0);
  });
});
