import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebhook, deleteWebhook, getWebhooks } from "../index";
import { setupWebhook } from "../webhooks";

vi.mock("../index", () => ({
  createWebhook: vi.fn(),
  deleteWebhook: vi.fn(),
  getWebhooks: vi.fn(),
}));

const options = {
  organizationId: "example",
  apiKey: "example",
  baseUrl: "https://api.example.com/",
  localTimezone: "America/Chicago",
  basicAuthUsername: "donations",
  basicAuthPassword: "example",
};

const url = "https://example.com/donations";
const subscription = {
  id: "1",
  name: "Donation subscription",
  url,
  trigger: "CREATE_DONATION",
  contentType: "application/json",
  triggerSelfImport: false,
  httpBasic: { userName: options.basicAuthUsername },
  customParameters: null,
};

describe("setupWebhook", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("reuses the authenticated subscription and leaves unrelated hooks alone", async () => {
    vi.mocked(getWebhooks).mockResolvedValue({
      ok: true,
      data: [
        { ...subscription, id: "2", httpBasic: null },
        {
          ...subscription,
          id: "3",
          trigger: "UPDATE_DONATION",
          httpBasic: null,
        },
        subscription,
      ],
    });

    await setupWebhook(url, "CREATE_DONATION", options);

    expect(createWebhook).not.toHaveBeenCalled();
    expect(deleteWebhook).not.toHaveBeenCalled();
  });

  it("creates an authenticated subscription when only an unauthenticated hook matches", async () => {
    vi.mocked(getWebhooks).mockResolvedValue({
      ok: true,
      data: [{ ...subscription, httpBasic: null }],
    });
    vi.mocked(createWebhook).mockResolvedValue({ ok: true, data: { id: "2" } });

    await setupWebhook(url, "CREATE_DONATION", options);

    expect(createWebhook).toHaveBeenCalledWith(
      options,
      expect.objectContaining({
        trigger: "CREATE_DONATION",
        httpBasic: {
          userName: options.basicAuthUsername,
          password: options.basicAuthPassword,
        },
      }),
    );
    expect(deleteWebhook).not.toHaveBeenCalled();
  });

  it("does not match null auth against an unconfigured username", async () => {
    vi.mocked(getWebhooks).mockResolvedValue({
      ok: true,
      data: [{ ...subscription, httpBasic: null }],
    });
    vi.mocked(createWebhook).mockResolvedValue({ ok: true, data: { id: "2" } });

    await setupWebhook(url, "CREATE_DONATION", {
      ...options,
      basicAuthUsername: undefined,
    });

    expect(createWebhook).toHaveBeenCalledOnce();
    expect(deleteWebhook).not.toHaveBeenCalled();
  });
});
