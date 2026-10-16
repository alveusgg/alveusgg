import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { getUserBanFromBroadcaster } from "@/server/apis/twitch";

vi.mock("@/env", () => ({ env: { TWITCH_CLIENT_ID: "test-client" } }));
const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function lookup() {
  return getUserBanFromBroadcaster(
    "private-broadcaster-token",
    "636587384",
    "123",
    AbortSignal.timeout(5000),
  );
}

test("only a successful empty response establishes unbanned status", async () => {
  fetchMock.mockResolvedValue(Response.json({ data: [] }));
  expect(await lookup()).toBeNull();
  const [rawUrl, init] = fetchMock.mock.calls[0]!;
  const url = new URL(rawUrl);
  expect(url.pathname).toBe("/helix/moderation/banned");
  expect(url.searchParams.get("broadcaster_id")).toBe("636587384");
  expect(url.searchParams.get("user_id")).toBe("123");
  expect(init).toMatchObject({
    headers: {
      "Client-Id": "test-client",
      Authorization: "Bearer private-broadcaster-token",
    },
    signal: expect.any(AbortSignal),
    cache: "no-store",
    redirect: "error",
  });
});

test.each(["", "2026-10-16T10:02:00Z"])(
  "bans and timeouts are parsed without retaining moderation reasons: %s",
  async (expiresAt) => {
    fetchMock.mockResolvedValue(
      Response.json({
        data: [
          {
            user_id: "123",
            expires_at: expiresAt,
            reason: "private moderation reason",
          },
        ],
      }),
    );
    expect(await lookup()).toEqual({ expiresAt: expiresAt || null });
  },
);

test.each([401, 403, 404, 429, 500, 503])(
  "HTTP %i cannot be mistaken for an unbanned user",
  async (status) => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "private upstream sentinel" }, { status }),
    );
    await expect(lookup()).rejects.toThrow(
      "Could not verify Twitch chat ban status.",
    );
    expect(console.error).not.toHaveBeenCalled();
  },
);

test.each([
  {},
  { data: null },
  { data: [{ user_id: "456", expires_at: "" }] },
  { data: [{ user_id: "123" }] },
  { data: [{ user_id: "123", expires_at: "invalid" }] },
  {
    data: [
      { user_id: "123", expires_at: "" },
      { user_id: "123", expires_at: "" },
    ],
  },
])("invalid or unrelated responses never grant access: %j", async (body) => {
  fetchMock.mockResolvedValue(Response.json(body));
  await expect(lookup()).rejects.toThrow("Invalid Twitch chat ban response.");
  expect(console.error).not.toHaveBeenCalled();
});

test("network failures propagate without treating the user as unbanned", async () => {
  fetchMock.mockRejectedValue(new Error("network unavailable"));
  await expect(lookup()).rejects.toThrow("network unavailable");
});
