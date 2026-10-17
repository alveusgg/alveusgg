import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
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
