import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
  getBroadcasterSubscriptionForUser,
  getUserByName,
  getUserSubscribedToBroadcaster,
} from "@/server/apis/twitch";
import { ExpiredAccessTokenError } from "@/server/utils/oauth2";

const { fetchMock, clientCredentials } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  clientCredentials: vi.fn(async () => "application-test-token"),
}));
vi.mock("@/env", () => ({
  env: {
    TWITCH_CLIENT_ID: "local-test-client",
    TWITCH_CLIENT_SECRET: "local-test-secret",
  },
}));
vi.mock("@/server/utils/oauth2", () => ({
  ExpiredAccessTokenError: class extends Error {},
  getClientCredentialsAccessToken: clientCredentials,
}));
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("subscription verification forwards an abort deadline and returns false only for a real non-subscription response", async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
  const signal = AbortSignal.timeout(5000);
  expect(
    await getUserSubscribedToBroadcaster(
      "private-user-token",
      "user",
      "alveus",
      { signal, quiet: true },
    ),
  ).toBe(false);
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/helix/subscriptions/user?"),
    expect.objectContaining({
      signal,
      headers: {
        "Client-Id": "local-test-client",
        Authorization: "Bearer private-user-token",
      },
    }),
  );
});

test.each([401, 403])(
  "Twitch HTTP %i requests reauthentication instead of granting subscriber access",
  async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));
    await expect(
      getUserSubscribedToBroadcaster("private-user-token", "user", "alveus", {
        quiet: true,
      }),
    ).rejects.toBeInstanceOf(ExpiredAccessTokenError);
  },
);

test("quiet subscription failures never log arbitrary Twitch response bodies", async () => {
  fetchMock.mockResolvedValue(
    Response.json({ message: "sensitive-upstream-sentinel" }, { status: 503 }),
  );
  await expect(
    getUserSubscribedToBroadcaster("private-user-token", "user", "alveus", {
      quiet: true,
    }),
  ).rejects.toThrow("Could not get subscription status!");
  expect(console.error).not.toHaveBeenCalled();
});

test("a subscriber check never replaces the application's cached credentials with a user's token", async () => {
  fetchMock
    .mockResolvedValueOnce(new Response(null, { status: 404 }))
    .mockResolvedValueOnce(Response.json({ data: [] }));
  await getUserSubscribedToBroadcaster("private-user-token", "user", "alveus", {
    quiet: true,
  });
  await getUserByName("alveus");
  expect(clientCredentials).toHaveBeenCalledWith(
    "twitch",
    "local-test-client",
    "local-test-secret",
  );
  expect(fetchMock.mock.calls[1]?.[1].headers.Authorization).toBe(
    "Bearer application-test-token",
  );
});

test("broadcaster verification filters the exact user and Alveus channel with a bounded signal", async () => {
  const signal = AbortSignal.timeout(5000);
  fetchMock.mockResolvedValue(
    Response.json({
      data: [{ user_id: "123", broadcaster_id: "636587384", tier: "1000" }],
    }),
  );
  expect(
    await getBroadcasterSubscriptionForUser(
      "private-broadcaster-token",
      "636587384",
      "123",
      signal,
    ),
  ).toBe(true);
  const [rawUrl, init] = fetchMock.mock.calls[0]!;
  const url = new URL(rawUrl);
  expect(url.pathname).toBe("/helix/subscriptions");
  expect(url.searchParams.get("user_id")).toBe("123");
  expect(url.searchParams.get("broadcaster_id")).toBe("636587384");
  expect(init.signal).toBe(signal);
  expect(init.headers.Authorization).toBe("Bearer private-broadcaster-token");
});

test("only a successful empty filtered subscription response means not subscribed", async () => {
  fetchMock.mockResolvedValue(Response.json({ data: [] }));
  expect(
    await getBroadcasterSubscriptionForUser(
      "private-broadcaster-token",
      "636587384",
      "123",
      AbortSignal.timeout(5000),
    ),
  ).toBe(false);
});

test.each([
  { user_id: "different-user", broadcaster_id: "636587384", tier: "1000" },
  { user_id: "123", broadcaster_id: "different-channel", tier: "1000" },
])(
  "unrelated subscriber records never authorize the chat actor: %j",
  async (entry) => {
    fetchMock.mockResolvedValue(Response.json({ data: [entry] }));
    await expect(
      getBroadcasterSubscriptionForUser(
        "private-broadcaster-token",
        "636587384",
        "123",
        AbortSignal.timeout(5000),
      ),
    ).rejects.toThrow("unexpected identity");
  },
);

test.each([401, 403, 404, 429, 500, 503])(
  "broadcaster HTTP %i is unavailable, not proof of non-subscription",
  async (status) => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "sensitive-upstream-sentinel" }, { status }),
    );
    await expect(
      getBroadcasterSubscriptionForUser(
        "private-broadcaster-token",
        "636587384",
        "123",
        AbortSignal.timeout(5000),
      ),
    ).rejects.toThrow("Could not verify broadcaster subscription.");
    expect(console.error).not.toHaveBeenCalled();
  },
);

test("malformed broadcaster success responses fail closed without logging upstream bodies", async () => {
  fetchMock.mockResolvedValue(Response.json({ data: [{ user_id: "123" }] }));
  await expect(
    getBroadcasterSubscriptionForUser(
      "private-broadcaster-token",
      "636587384",
      "123",
      AbortSignal.timeout(5000),
    ),
  ).rejects.toThrow();
  expect(console.error).not.toHaveBeenCalled();
});
