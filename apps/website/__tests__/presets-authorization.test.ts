import { randomUUID } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { type Session } from "next-auth";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type * as PresetPolicyModule from "@/server/presets/policy";
import type * as PresetServiceModule from "@/server/presets/service";
import { type Context } from "@/server/trpc/context";
import { presetsRouter } from "@/server/trpc/router/presets";
import type * as AuthModule from "@/server/utils/auth";
import { ExpiredAccessTokenError } from "@/server/utils/oauth2";

const { db, subscription, account, execute, setPolicy, banned } = vi.hoisted(
  () => ({
    db: {
      cameraPresetOperation: { findUnique: vi.fn() },
      cameraPresetPolicy: { findMany: vi.fn() },
    },
    subscription: vi.fn(),
    account: vi.fn(),
    execute: vi.fn(),
    setPolicy: vi.fn(),
    banned: vi.fn(),
  }),
);
vi.mock("@/server/utils/twitch-bans", () => ({
  isPresetUserBanned: banned,
  isTwitchUserBanned: banned,
}));
vi.mock("@alveusgg/database", () => ({ prisma: db }));
vi.mock("@/env", () => ({
  env: {
    NODE_ENV: "test",
    SUPER_USER_IDS: "super-user",
    DISABLE_ADMIN_AUTH: false,
    TRPC_API_SHARED_KEY: ["local-worker-key"],
  },
}));
vi.mock("@/server/apis/twitch", () => ({
  getUserSubscribedToBroadcaster: subscription,
}));
vi.mock("@/server/utils/auth", async (original) => ({
  ...(await original<typeof AuthModule>()),
  getUserTwitchAccount: account,
}));
vi.mock("@/server/oauth/tokens", () => ({ issueAccessToken: vi.fn() }));
vi.mock("@/server/presets/service", async (original) => ({
  ...(await original<typeof PresetServiceModule>()),
  commandPreset: execute,
}));
vi.mock("@/server/presets/policy", async (original) => ({
  ...(await original<typeof PresetPolicyModule>()),
  setSubscriberPolicy: setPolicy,
}));

const id = "aeef07fa-ea5c-4fd2-bbcb-8f60d67ff38b";
const input = { id, action: "load" as const, camera: "crow", name: "home" };
function session(
  id = "user",
  roles: string[] = [],
  scopes = ["user:read:subscriptions"],
): Session {
  return {
    expires: "2099-01-01T00:00:00Z",
    user: { id, name: "User Name", roles, scopes, isSuperUser: false },
  };
}
function caller(session: Session | null) {
  const setHeader = vi.fn();
  return {
    api: presetsRouter.createCaller({
      session,
      req: { headers: {} },
      res: { setHeader },
      prisma: db,
    } as unknown as Context),
    setHeader,
  };
}
function stored(actorId = "user") {
  return {
    id,
    command: {
      ...input,
      camera: "crowoutdoor",
      authorization: "subscriber",
      actor: { id: actorId, name: "Original Name" },
    },
    commandHash: "unused",
    action: "load",
    camera: "crowoutdoor",
    status: "pending",
    expectedCameraVersion: 0,
    expectedNameVersion: null,
    preset: null,
    result: null,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 15000),
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  banned.mockResolvedValue(false);
  db.cameraPresetOperation.findUnique.mockResolvedValue(null);
  db.cameraPresetPolicy.findMany.mockResolvedValue([
    { scope: "global", paused: false, resumeAt: null },
  ]);
  subscription.mockResolvedValue({ tier: "1000" });
  account.mockResolvedValue({
    id: "twitch-user",
    token: "private-test-access-token",
  });
  execute.mockResolvedValue({ id, status: "pending" });
  setPolicy.mockResolvedValue({
    scope: "global",
    paused: true,
    resumeAt: null,
    subscriberControlsPaused: true,
    pausedCameras: [],
  });
});

describe("website preset authorization", () => {
  test("anonymous visitors can inspect access but cannot issue commands or read operations", async () => {
    const { api } = caller(null);
    expect(await api.access()).toMatchObject({
      canLoad: false,
      canManage: false,
      reason: "login",
    });
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(api.userOperation({ id })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(subscription).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  test("a signed-in non-subscriber is denied by a fresh server-side subscription check", async () => {
    const { api } = caller(session());
    subscription.mockResolvedValue(false);
    expect(await api.access()).toMatchObject({
      canLoad: false,
      canManage: false,
      canPauseSubscribers: false,
      reason: "subscription",
    });
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(execute).not.toHaveBeenCalled();
    // A user denied anyway doesn't spend a broadcaster-token ban lookup.
    expect(banned).not.toHaveBeenCalled();
  });

  test("verified subscribers load through camera aliases with no chat-write scope and a server-derived actor", async () => {
    const { api } = caller(session());
    expect(await api.access()).toMatchObject({
      canLoad: true,
      canManage: false,
      reason: null,
    });
    await api.userCommand(input);
    expect(execute).toHaveBeenCalledWith(
      {
        ...input,
        camera: "crowoutdoor",
        authorization: "subscriber",
        actor: { id: "user", name: "User Name" },
      },
      { cooldownUserId: "user" },
    );
    expect(subscription).toHaveBeenLastCalledWith(
      "private-test-access-token",
      "twitch-user",
      "636587384",
      expect.objectContaining({ quiet: true, signal: expect.any(AbortSignal) }),
    );
  });

  test.each(["save", "rename", "remove", "clear"] as const)(
    "subscribers cannot %s presets",
    async (action) => {
      const request = {
        ...input,
        action,
        name: action === "clear" ? undefined : "home",
        ...(action === "rename" ? { newName: "renamed" } : {}),
      };
      await expect(
        caller(session()).api.userCommand(request),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(execute).not.toHaveBeenCalled();
    },
  );

  test("operators can manage and load without subscription or chat scopes, even while subscriber controls are paused", async () => {
    db.cameraPresetPolicy.findMany.mockResolvedValue([]);
    const { api } = caller(session("operator", ["ptzControl"], []));
    expect(await api.access()).toMatchObject({
      canLoad: true,
      canManage: true,
      reason: null,
      subscriberControlsPaused: true,
    });
    await api.userCommand({ ...input, action: "save" });
    await api.userCommand({ ...input, id: randomUUID() });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        authorization: "operator",
        actor: { id: "operator", name: "User Name" },
      }),
      { cooldownUserId: "operator" },
    );
    expect(subscription).not.toHaveBeenCalled();
    expect(account).not.toHaveBeenCalled();
  });

  test("superusers follow the site's existing operator permission semantics", async () => {
    expect(
      await caller(session("super-user", [], [])).api.access(),
    ).toMatchObject({ canLoad: true, canManage: true });
    expect(subscription).not.toHaveBeenCalled();
  });

  test("missing subscription scope requests reauthentication without requiring a chat scope", async () => {
    const { api } = caller(session("user", [], []));
    expect(await api.access()).toMatchObject({ reason: "subscription-scope" });
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(account).not.toHaveBeenCalled();
    expect(subscription).not.toHaveBeenCalled();
  });

  test("revoked subscription authorization is a reauthentication condition", async () => {
    subscription.mockRejectedValue(new ExpiredAccessTokenError());
    expect(await caller(session()).api.access()).toMatchObject({
      reason: "subscription-scope",
    });
  });

  test("Twitch outages fail closed with 503 and never expose access tokens or upstream errors", async () => {
    const { api } = caller(session());
    subscription.mockRejectedValue(
      new Error("private-test-access-token in upstream failure"),
    );
    expect(await api.access()).toMatchObject({
      canLoad: false,
      reason: "unavailable",
    });
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Preset access verification is temporarily unavailable. Try again shortly.",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  test("client-supplied actors or authorization classifications are rejected", async () => {
    const api = caller(session()).api;
    for (const forged of [
      { ...input, actor: { id: "operator" } },
      { ...input, authorization: "operator" },
    ])
      await expect(api.userCommand(forged)).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    expect(execute).not.toHaveBeenCalled();
  });

  test("operation status belongs to its actor; operators can inspect other users' operations", async () => {
    db.cameraPresetOperation.findUnique.mockResolvedValue(stored("owner"));
    await expect(
      caller(session("foreign")).api.userOperation({ id }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(
      await caller(session("owner")).api.userOperation({ id }),
    ).toMatchObject({ id, status: "pending" });
    expect(
      await caller(session("operator", ["ptzControl"])).api.userOperation({
        id,
      }),
    ).toMatchObject({ id });
    await expect(
      caller(session("operator", ["ptzControl"])).api.userCommand(input),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(subscription).not.toHaveBeenCalled();
  });

  test("missing operations remain distinct from authorization or service failures", async () => {
    await expect(
      caller(session()).api.userOperation({ id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("an owned UUID retry recovers its existing outcome despite changed display name or Twitch outage", async () => {
    db.cameraPresetOperation.findUnique.mockResolvedValue(stored());
    subscription.mockRejectedValue(new Error("Twitch unavailable"));
    await caller(session()).api.userCommand(input);
    expect(subscription).not.toHaveBeenCalled();
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ id, actor: { id: "user", name: "User Name" } }),
      { cooldownUserId: "user" },
    );
  });

  test("cooldown responses are 429 with a bounded retry header", async () => {
    execute.mockRejectedValue(
      new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Please wait 1.5 seconds between preset commands.",
      }),
    );
    const { api, setHeader } = caller(session());
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
    expect(setHeader).toHaveBeenCalledWith("Retry-After", "2");
  });

  test("new commands recheck subscription instead of trusting an earlier access result", async () => {
    const api = caller(session()).api;
    expect((await api.access()).canLoad).toBe(true);
    subscription.mockResolvedValue(false);
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  test.each([
    [session(), "twitch-user"],
    [session("operator", ["ptzControl"], []), "operator"],
    [session("super-user", [], []), "super-user"],
  ])(
    "chat bans override subscription, operator roles and superuser privileges: %j",
    async (identity, checked) => {
      banned.mockResolvedValue(true);
      const api = caller(identity).api;
      expect(await api.access()).toMatchObject({
        canLoad: false,
        canManage: false,
        canPauseSubscribers: false,
        reason: "banned",
      });
      await expect(api.userCommand(input)).rejects.toMatchObject({
        code: "FORBIDDEN",
        message: expect.stringContaining("banned or timed out"),
      });
      expect(banned).toHaveBeenCalledWith(checked);
      expect(execute).not.toHaveBeenCalled();
    },
  );

  test("subscriber ban checks reuse the Twitch identity from the subscription check", async () => {
    await caller(session()).api.access();
    expect(account).toHaveBeenCalledOnce();
    expect(banned).toHaveBeenCalledExactlyOnceWith("twitch-user");
  });

  test("a banned operator cannot bypass moderation through a management action", async () => {
    banned.mockResolvedValue(true);
    await expect(
      caller(session("operator", ["ptzControl"])).api.userCommand({
        ...input,
        action: "save",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(execute).not.toHaveBeenCalled();
  });

  test("a ban imposed after an access query denies a new command", async () => {
    const api = caller(session()).api;
    expect((await api.access()).canLoad).toBe(true);
    banned.mockResolvedValue(true);
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  test("moderation outages fail closed for operators and do not expose provider errors", async () => {
    banned.mockRejectedValue(
      new Error("private-broadcaster-token upstream sentinel"),
    );
    const api = caller(session("operator", ["ptzControl"])).api;
    expect(await api.access()).toMatchObject({
      canLoad: false,
      canManage: false,
      canPauseSubscribers: true,
      reason: "unavailable",
    });
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Preset access verification is temporarily unavailable. Try again shortly.",
    });
    expect(execute).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Preset chat ban verification failed:",
      expect.any(Error),
    );
  });

  test("the former shared-key command entry point is absent", async () => {
    const api = caller(session("operator", ["ptzControl"])).api as unknown as {
      command: (input: unknown) => Promise<unknown>;
    };
    await expect(api.command(input)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("subscriber control policy authorization", () => {
  test("the missing global setting fails closed for subscribers", async () => {
    db.cameraPresetPolicy.findMany.mockResolvedValue([]);
    const api = caller(session()).api;
    expect(await api.access()).toMatchObject({
      canLoad: false,
      reason: "paused",
      subscriberControlsPaused: true,
    });
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  test("a camera pause denies its canonical target while leaving global access available", async () => {
    db.cameraPresetPolicy.findMany.mockResolvedValue([
      { scope: "global", paused: false, resumeAt: null },
      { scope: "camera:crowoutdoor", paused: true, resumeAt: null },
    ]);
    const api = caller(session()).api;
    expect(await api.access()).toMatchObject({
      canLoad: true,
      pausedCameras: ["crowoutdoor"],
    });
    await expect(api.userCommand(input)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  test("timed pauses expire without a background unlock job", async () => {
    db.cameraPresetPolicy.findMany.mockResolvedValue([
      { scope: "global", paused: true, resumeAt: new Date(Date.now() - 1) },
    ]);
    expect(await caller(session()).api.access()).toMatchObject({
      canLoad: true,
      subscriberControlsPaused: false,
    });
  });

  test("only operators can change pause settings; the server supplies their audit identity", async () => {
    await expect(
      caller(null).api.setSubscriberControl({ paused: false }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      caller(session()).api.setSubscriberControl({ paused: false }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await caller(session("operator", ["ptzControl"])).api.setSubscriberControl({
      camera: "crow",
      paused: true,
    });
    expect(setPolicy).toHaveBeenCalledWith(
      { camera: "crowoutdoor", paused: true },
      "operator",
    );
  });

  test.each([true, false])(
    "a banned operator cannot change pause settings: paused %s",
    async (paused) => {
      banned.mockResolvedValue(true);
      await expect(
        caller(session("operator", ["ptzControl"])).api.setSubscriberControl({
          paused,
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        message: expect.stringContaining("banned or timed out"),
      });
      expect(setPolicy).not.toHaveBeenCalled();
    },
  );

  test("operators can still pause, but not resume, while moderation verification is unavailable", async () => {
    banned.mockRejectedValue(new Error("Twitch unavailable"));
    const api = caller(session("operator", ["ptzControl"])).api;
    await api.setSubscriberControl({ paused: true });
    expect(setPolicy).toHaveBeenCalledWith({ paused: true }, "operator");
    await expect(
      api.setSubscriberControl({ paused: false }),
    ).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    expect(setPolicy).toHaveBeenCalledOnce();
  });
});
