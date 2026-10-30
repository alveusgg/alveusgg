import { afterEach, expect, test, vi } from "vitest";

import { refreshAccessToken } from "@/server/utils/oauth2";

const { update } = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock("@alveusgg/database", () => ({ prisma: { account: { update } } }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

test.each(["network", "server"])(
  "does not mark a failed token validation as verified (%s)",
  async (failure) => {
    vi.stubGlobal(
      "fetch",
      failure === "network"
        ? vi.fn().mockRejectedValue(new Error("network unavailable"))
        : vi
            .fn()
            .mockResolvedValue(new Response("unavailable", { status: 503 })),
    );
    await expect(
      refreshAccessToken(
        "twitch",
        "client",
        "secret",
        "account",
        "access",
        "refresh",
      ),
    ).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  },
);
