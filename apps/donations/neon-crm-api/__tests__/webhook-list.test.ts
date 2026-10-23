import { afterEach, describe, expect, it, vi } from "vitest";
import { setupWebhook } from "../webhooks";

const hook = {
  id: "1",
  name: "Donation subscription",
  url: "https://example.com/donations",
  trigger: "CREATE_DONATION",
  contentType: "application/json",
  triggerSelfImport: false,
  httpBasic: { userName: "donations" },
  customParameters: null,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("webhook listing failures", () => {
  it("reports a malformed donation hook and never creates or deletes subscriptions", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        Response.json([hook, { ...hook, id: "2", url: null }]),
      );
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onParseError = vi.fn();

    const options = {
      organizationId: "example",
      apiKey: "example",
      baseUrl: "https://api.example.com/",
      localTimezone: "America/Chicago",
      basicAuthUsername: "donations",
      basicAuthPassword: "example",
      onParseError,
    };
    await expect(
      setupWebhook(hook.url, "CREATE_DONATION", options),
    ).rejects.toThrow("Failed to list Neon webhooks before setup");

    expect(onParseError).toHaveBeenCalledWith(expect.anything(), {
      method: "GET",
      path: "webhooks",
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/webhooks",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
