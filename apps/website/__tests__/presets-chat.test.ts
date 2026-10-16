import { randomUUID } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type * as PresetServiceModule from "@/server/presets/service";
import { type Context } from "@/server/trpc/context";
import { presetsRouter } from "@/server/trpc/router/presets";

const { db, broadcasterSubscription, execute, configuration } = vi.hoisted(
  () => ({
    db: {
      account: { findUnique: vi.fn() },
      twitchChannel: { findUnique: vi.fn() },
      cameraPresetOperation: { findUnique: vi.fn() },
      cameraPresetPolicy: { findMany: vi.fn() },
    },
    broadcasterSubscription: vi.fn(),
    execute: vi.fn(),
    configuration: {
      NODE_ENV: "development",
      DISABLE_ADMIN_AUTH: true,
      SUPER_USER_IDS: "site-superuser",
      CHATBOT_PRESETS_SHARED_KEY: "dedicated-chat-preset-test-key-0123456789",
      TRPC_API_SHARED_KEY: ["worker-test-key"],
    },
  }),
);
vi.mock("@alveusgg/database", () => ({ prisma: db }));
vi.mock("@/env", () => ({ env: configuration }));
vi.mock("@/server/apis/twitch", () => ({
  getBroadcasterSubscriptionForUser: broadcasterSubscription,
}));
vi.mock("@/server/oauth/tokens", () => ({ issueAccessToken: vi.fn() }));
vi.mock("@/server/presets/service", async (original) => ({
  ...(await original<typeof PresetServiceModule>()),
  commandPreset: execute,
}));

const id = "aeef07fa-ea5c-4fd2-bbcb-8f60d67ff38b";
const request = {
  command: { id, action: "load" as const, camera: "crow", name: "home" },
  actor: { twitchUserId: "123456", name: "Viewer" },
};
function caller(key: string | null = configuration.CHATBOT_PRESETS_SHARED_KEY) {
  const setHeader = vi.fn();
  return {
    api: presetsRouter.createCaller({
      session: null,
      req: { headers: key === null ? {} : { authorization: `ApiKey ${key}` } },
      res: { setHeader },
      prisma: db,
    } as unknown as Context),
    setHeader,
  };
}
function account(userId = "site-user", roles: string[] = []) {
  return {
    user: {
      id: userId,
      name: "Site Name",
      roles: roles.map((role) => ({ role })),
    },
  };
}
function stored(actorId: string) {
  const now = new Date();
  return {
    id,
    action: "load",
    camera: "crowoutdoor",
    command: {
      ...request.command,
      camera: "crowoutdoor",
      actor: { id: actorId, name: "Original Name" },
      authorization: "subscriber",
    },
    commandHash: "unused",
    status: "pending",
    preset: null,
    result: null,
    error: null,
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + 15000),
  };
}
beforeEach(() => {
  vi.resetAllMocks();
  configuration.CHATBOT_PRESETS_SHARED_KEY =
    "dedicated-chat-preset-test-key-0123456789";
  db.account.findUnique.mockResolvedValue(null);
  db.cameraPresetOperation.findUnique.mockResolvedValue(null);
  db.cameraPresetPolicy.findMany.mockResolvedValue([
    { scope: "global", paused: false, resumeAt: null },
  ]);
  db.twitchChannel.findUnique.mockResolvedValue({
    broadcasterAccount: {
      providerAccountId: "636587384",
      access_token: "private-broadcaster-test-token",
      scope: "channel:read:subscriptions",
    },
  });
  broadcasterSubscription.mockResolvedValue(true);
  execute.mockResolvedValue({ id, status: "pending" });
});

describe("dedicated chatbot preset transport", () => {
  test.each([null, "incorrect-key", "worker-test-key"])(
    "rejects missing/wrong/general-worker credentials: %s",
    async (key) => {
      const api = caller(key).api;
      await expect(api.chatCommand(request)).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      await expect(
        api.chatOperation({ id, actor: { twitchUserId: "123456" } }),
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(db.account.findUnique).not.toHaveBeenCalled();
      expect(execute).not.toHaveBeenCalled();
    },
  );

  test("fails closed when the dedicated key is not configured", async () => {
    configuration.CHATBOT_PRESETS_SHARED_KEY = "";
    await expect(
      caller("some-key").api.chatCommand(request),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("strict schemas reject claimed badges, roles and subscriber flags", async () => {
    for (const actor of [
      { ...request.actor, isSubscriber: true },
      { ...request.actor, roles: ["ptzControl"] },
      { ...request.actor, badges: ["moderator"] },
    ])
      await expect(
        caller().api.chatCommand({ ...request, actor }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const forgedCommand = {
      ...request.command,
      actor: { id: "site-superuser" },
    };
    await expect(
      caller().api.chatCommand({ ...request, command: forgedCommand }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller().api.chatCommand({
        ...request,
        actor: { twitchUserId: "not-a-twitch-id" },
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(execute).not.toHaveBeenCalled();
  });
});

describe("chat actor permissions and broadcaster verification", () => {
  test("a verified unregistered subscriber can load without a website account or user OAuth scopes", async () => {
    await caller().api.chatCommand(request);
    expect(db.account.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          provider_providerAccountId: {
            provider: "twitch",
            providerAccountId: "123456",
          },
        },
      }),
    );
    expect(broadcasterSubscription).toHaveBeenCalledWith(
      "private-broadcaster-test-token",
      "636587384",
      "123456",
      expect.any(AbortSignal),
    );
    expect(execute).toHaveBeenCalledWith(
      {
        ...request.command,
        camera: "crowoutdoor",
        actor: { id: "twitch:123456", name: "Viewer" },
        authorization: "subscriber",
      },
      { cooldownUserId: "twitch:123456" },
    );
  });

  test("linked subscribers use their site identity and the same cooldown as website actions", async () => {
    db.account.findUnique.mockResolvedValue(account());
    await caller().api.chatCommand(request);
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: { id: "site-user", name: "Site Name" },
        authorization: "subscriber",
      }),
      { cooldownUserId: "site-user" },
    );
  });

  test("fresh site operator roles permit management without trusting chat badges or querying Twitch subscriptions", async () => {
    db.account.findUnique.mockResolvedValue(
      account("operator", ["ptzControl"]),
    );
    await caller().api.chatCommand({
      ...request,
      command: { ...request.command, action: "save" },
    });
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: { id: "operator", name: "Site Name" },
        authorization: "operator",
      }),
      { cooldownUserId: "operator" },
    );
    expect(broadcasterSubscription).not.toHaveBeenCalled();
  });

  test("actual site superuser IDs can manage, while the development browser bypass never elevates chat users", async () => {
    db.account.findUnique.mockResolvedValue(account("site-superuser"));
    await caller().api.chatCommand({
      ...request,
      command: { ...request.command, action: "save" },
    });
    expect(execute).toHaveBeenCalledTimes(1);
    db.account.findUnique.mockResolvedValue(account("ordinary-site-user"));
    await expect(
      caller().api.chatCommand({
        ...request,
        command: { ...request.command, id: randomUUID(), action: "save" },
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  test.each(["save", "rename", "remove", "clear"] as const)(
    "unregistered/subscriber users cannot %s presets",
    async (action) => {
      await expect(
        caller().api.chatCommand({
          ...request,
          command: {
            ...request.command,
            action,
            name: action === "clear" ? undefined : "home",
            ...(action === "rename" ? { newName: "renamed" } : {}),
          },
        }),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(execute).not.toHaveBeenCalled();
    },
  );

  test("a non-subscriber is denied even if the trusted transport is authenticated", async () => {
    broadcasterSubscription.mockResolvedValue(false);
    await expect(caller().api.chatCommand(request)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  test("missing broadcaster credentials fail unavailable rather than granting access or blaming the user's subscription", async () => {
    db.twitchChannel.findUnique.mockResolvedValue(null);
    await expect(caller().api.chatCommand(request)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
    expect(broadcasterSubscription).not.toHaveBeenCalled();
  });

  test("the broadcaster must grant its own channel subscription scope", async () => {
    db.twitchChannel.findUnique.mockResolvedValue({
      broadcasterAccount: {
        providerAccountId: "636587384",
        access_token: "private-broadcaster-test-token",
        scope: "user:read:subscriptions",
      },
    });
    await expect(caller().api.chatCommand(request)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
    expect(broadcasterSubscription).not.toHaveBeenCalled();
  });

  test("a broadcaster account for another channel cannot verify Alveus subscriptions", async () => {
    db.twitchChannel.findUnique.mockResolvedValue({
      broadcasterAccount: {
        providerAccountId: "wrong-channel",
        access_token: "private-broadcaster-test-token",
        scope: "channel:read:subscriptions",
      },
    });
    await expect(caller().api.chatCommand(request)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
    expect(broadcasterSubscription).not.toHaveBeenCalled();
  });

  test("Twitch outages do not leak credentials or upstream responses", async () => {
    broadcasterSubscription.mockRejectedValue(
      new Error("private-broadcaster-test-token upstream"),
    );
    await expect(caller().api.chatCommand(request)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Subscription verification is temporarily unavailable. Try again shortly.",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  test("subscriber pauses also apply to verified chat loads", async () => {
    db.cameraPresetPolicy.findMany.mockResolvedValue([
      { scope: "global", paused: false, resumeAt: null },
      { scope: "camera:crowoutdoor", paused: true, resumeAt: null },
    ]);
    await expect(caller().api.chatCommand(request)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  test("operators bypass subscriber pauses but still use the shared durable cooldown", async () => {
    db.account.findUnique.mockResolvedValue(
      account("operator", ["ptzControl"]),
    );
    db.cameraPresetPolicy.findMany.mockResolvedValue([]);
    execute.mockRejectedValue(
      new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Please wait 1.5 seconds between preset commands.",
      }),
    );
    const { api, setHeader } = caller();
    await expect(api.chatCommand(request)).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
    expect(setHeader).toHaveBeenCalledWith("Retry-After", "2");
    expect(broadcasterSubscription).not.toHaveBeenCalled();
  });
});

describe("chat UUID recovery and operation ownership", () => {
  test("an original owner recovers its UUID before checking current subscription or consuming another cooldown", async () => {
    db.cameraPresetOperation.findUnique.mockResolvedValue(
      stored("twitch:123456"),
    );
    broadcasterSubscription.mockRejectedValue(new Error("Twitch down"));
    await caller().api.chatCommand(request);
    expect(broadcasterSubscription).not.toHaveBeenCalled();
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        id,
        actor: { id: "twitch:123456", name: "Viewer" },
      }),
      { cooldownUserId: "twitch:123456" },
    );
  });

  test("signup after an unregistered chat command preserves recovery of the accepted actor identity", async () => {
    db.account.findUnique.mockResolvedValue(account());
    db.cameraPresetOperation.findUnique.mockResolvedValue(
      stored("twitch:123456"),
    );
    await caller().api.chatCommand(request);
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        id,
        actor: { id: "twitch:123456", name: "Site Name" },
      }),
      { cooldownUserId: "site-user" },
    );
    expect(
      await caller().api.chatOperation({
        id,
        actor: { twitchUserId: "123456" },
      }),
    ).toMatchObject({ id });
    expect(broadcasterSubscription).not.toHaveBeenCalled();
  });

  test("foreign UUIDs cannot be polled or reused, even by another chat operator", async () => {
    db.account.findUnique.mockResolvedValue(
      account("operator", ["ptzControl"]),
    );
    db.cameraPresetOperation.findUnique.mockResolvedValue(
      stored("foreign-site-user"),
    );
    await expect(
      caller().api.chatOperation({ id, actor: { twitchUserId: "123456" } }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller().api.chatCommand(request)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(execute).not.toHaveBeenCalled();
  });

  test("missing operations remain explicit NOT_FOUND for bounded same-UUID recovery", async () => {
    await expect(
      caller().api.chatOperation({ id, actor: { twitchUserId: "123456" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
