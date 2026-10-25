import type { Session } from "next-auth";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { prisma } from "@alveusgg/database";

import type { Context } from "@/server/trpc/context";
import {
  protectedProcedure,
  router,
  twitchProcedure,
} from "@/server/trpc/trpc";
import { ExpiredAccessTokenError } from "@/server/utils/oauth2";

import { scopeGroups } from "@/data/twitch";

import { authOptions } from "@/pages/api/auth/[...nextauth]";

const { findAccount, findRoles, refresh } = vi.hoisted(() => ({
  findAccount: vi.fn(),
  findRoles: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@alveusgg/database", () => ({
  prisma: {
    account: { findFirst: findAccount },
    userRole: { findMany: findRoles },
  },
}));
vi.mock("@/env", () => ({
  env: {
    SUPER_USER_IDS: "",
    NODE_ENV: "test",
    TWITCH_CLIENT_ID: "client",
    TWITCH_CLIENT_SECRET: "secret",
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
  },
}));
vi.mock("@/server/utils/oauth2", () => ({
  ExpiredAccessTokenError: class extends Error {},
  refreshAccessToken: refresh,
}));

const websiteSession = {
  user: { name: "Alveus member", email: "member@example.com" },
  expires: "2090-01-01T00:00:00.000Z",
};
async function session(): Promise<Session> {
  const callback = authOptions.callbacks!.session!;
  return (await callback({
    session: structuredClone(websiteSession),
    user: {
      id: "alveus-user",
      name: "Alveus member",
      email: "member@example.com",
      emailVerified: null,
    },
    token: {},
  } as Parameters<typeof callback>[0])) as Session;
}
function account() {
  return {
    id: "account",
    providerAccountId: "twitch-user",
    access_token: "private-access",
    refresh_token: "private-refresh",
    verified_at: Math.floor(Date.now() / 1000),
    expires_at: Math.floor(Date.now() / 1000) + 7200,
    scope: "openid user:write:chat",
    twitchChannelBroadcaster: [],
    twitchChannelModerator: [],
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  findRoles.mockResolvedValue([{ role: "dashboard" }]);
});

describe("website sessions and Twitch connections", () => {
  test("preserves the website identity and roles without a Twitch account", async () => {
    findAccount.mockResolvedValue(null);
    expect(await session()).toMatchObject({
      ...websiteSession,
      user: { id: "alveus-user", roles: ["dashboard"] },
    });
    expect((await session()).user?.twitch).toBeUndefined();
    expect(refresh).not.toHaveBeenCalled();
  });
  test("exposes Twitch scopes without exposing its tokens", async () => {
    findAccount.mockResolvedValue(account());
    const result = await session();
    expect(result.user?.twitch).toEqual({
      id: "twitch-user",
      scopes: ["openid", "user:write:chat"],
    });
    expect(JSON.stringify(result)).not.toContain("private-");
  });
  test.each([
    [new ExpiredAccessTokenError(), "expired"],
    [new Error("network failure"), "unavailable"],
  ])(
    "keeps the website session when Twitch verification fails",
    async (error, status) => {
      findAccount.mockResolvedValue({ ...account(), verified_at: 0 });
      refresh.mockRejectedValue(error);
      const result = await session();
      expect(result.expires).toBe(websiteSession.expires);
      expect(result.user).toMatchObject({
        id: "alveus-user",
        roles: ["dashboard"],
        twitch: { scopes: [], error: status },
      });
    },
  );
  test.each(["twitchChannelBroadcaster", "twitchChannelModerator"])(
    "reports missing channel permissions without invalidating the session (%s)",
    async (relation) => {
      findAccount.mockResolvedValue({
        ...account(),
        [relation]: [{ channelId: "channel" }],
      });
      const result = await session();
      expect(result.user?.twitch?.requiredScopes).toEqual(
        scopeGroups.api.filter((scope) => scope !== "user:write:chat"),
      );
      expect(result.expires).toBe(websiteSession.expires);
      expect(result.user).toMatchObject({
        id: "alveus-user",
        roles: ["dashboard"],
      });
    },
  );
  test("requires reconnection when there are no usable Twitch credentials", async () => {
    findAccount.mockResolvedValue({ ...account(), access_token: null });
    expect((await session()).user?.twitch).toMatchObject({
      error: "expired",
      scopes: [],
    });
  });
});

test("website procedures remain available while Twitch procedures require a usable connection", async () => {
  const api = router({
    website: protectedProcedure.query(() => "website"),
    twitch: twitchProcedure.query(() => "twitch"),
  });
  const caller = (twitch?: NonNullable<Session["user"]>["twitch"]) =>
    api.createCaller({
      session: {
        user: { id: "user", roles: [], isSuperUser: false, twitch },
        expires: websiteSession.expires,
      },
      req: {} as Context["req"],
      res: {} as Context["res"],
      prisma,
    });
  for (const twitch of [
    undefined,
    { id: "twitch-user", scopes: [], error: "expired" as const },
  ]) {
    await expect(caller(twitch).website()).resolves.toBe("website");
    await expect(caller(twitch).twitch()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  }
  await expect(
    caller({ id: "twitch-user", scopes: [] }).twitch(),
  ).resolves.toBe("twitch");
});
