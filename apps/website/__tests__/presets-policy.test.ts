import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type * as DatabaseModule from "@alveusgg/database";

import {
  effectiveSubscriberPolicy,
  setSubscriberPolicy,
} from "@/server/presets/policy";
import { claimPresetLoad, getPresetOperation } from "@/server/presets/service";

const { db, banned } = vi.hoisted(() => ({
  banned: vi.fn(),
  db: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    cameraPresetPolicy: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    cameraPresetOperation: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));
vi.mock("@/server/utils/twitch-bans", () => ({ isPresetUserBanned: banned }));
vi.mock("@alveusgg/database", async (original) => ({
  ...(await original<typeof DatabaseModule>()),
  prisma: db,
}));
vi.mock("@/env", () => ({ env: {} }));
vi.mock("@/server/oauth/tokens", () => ({ issueAccessToken: vi.fn() }));

const id = "aeef07fa-ea5c-4fd2-bbcb-8f60d67ff38b";
const now = new Date("2026-10-16T10:00:00Z");
const subscriber = {
  id,
  camera: "garden",
  action: "load",
  command: {
    id,
    camera: "garden",
    action: "load",
    name: "home",
    authorization: "subscriber",
    actor: { id: "user" },
  },
  status: "pending",
  dispatchedAt: null,
  preset: null,
  result: null,
  error: null,
  createdAt: now,
  updatedAt: now,
  expiresAt: new Date("2099-01-01T00:00:00Z"),
};
const operator = {
  ...subscriber,
  id: "beef07fa-ea5c-4fd2-bbcb-8f60d67ff38b",
  command: {
    ...subscriber.command,
    authorization: "operator",
    actor: { id: "operator" },
  },
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  banned.mockResolvedValue(false);
  db.$transaction.mockImplementation(async (fn) => fn(db));
  db.cameraPresetOperation.findUnique.mockResolvedValue(subscriber);
  db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue(subscriber);
  db.cameraPresetOperation.update.mockImplementation(async ({ data }) => ({
    ...subscriber,
    ...data,
  }));
  db.cameraPresetPolicy.findMany.mockResolvedValue([
    { scope: "global", paused: true, resumeAt: null },
  ]);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("missing global settings fail closed while missing camera settings are unpaused", () => {
  expect(effectiveSubscriberPolicy([], now.getTime())).toEqual({
    subscriberControlsPaused: true,
    pausedCameras: [],
  });
});

test("effective timed pauses expire without mutating stored policy or needing a timer", () => {
  expect(
    effectiveSubscriberPolicy(
      [
        {
          scope: "global",
          paused: true,
          resumeAt: new Date(now.getTime() - 1),
        },
        { scope: "camera:fox", paused: true, resumeAt: null },
        {
          scope: "camera:garden",
          paused: true,
          resumeAt: new Date(now.getTime() - 1),
        },
      ],
      now.getTime(),
    ),
  ).toEqual({ subscriberControlsPaused: false, pausedCameras: ["fox"] });
});

test("a paused pending subscriber load is failed before the worker receives dispatchable state", async () => {
  expect(await getPresetOperation(id)).toMatchObject({
    status: "failed",
    error: expect.stringContaining("paused"),
  });
  expect(db.$queryRaw).toHaveBeenCalled();
});

test("operator loads do not acquire subscriber policy locks or fail when controls are paused", async () => {
  db.cameraPresetOperation.findUnique.mockResolvedValue(operator);
  expect(await getPresetOperation(operator.id)).toMatchObject({
    status: "pending",
  });
  expect(db.cameraPresetPolicy.createMany).not.toHaveBeenCalled();
  expect(db.cameraPresetOperation.update).not.toHaveBeenCalled();
  expect(banned).toHaveBeenCalledWith("operator");
});

test.each([subscriber, operator])(
  "pending loads from banned actors are cancelled before worker dispatch: $command.authorization",
  async (operation) => {
    banned.mockResolvedValue(true);
    db.cameraPresetOperation.findUnique.mockResolvedValue(operation);
    db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue({
      ...operation,
      status: "failed",
      error: "User banned or timed out",
    });
    expect(await getPresetOperation(operation.id)).toMatchObject({
      status: "failed",
    });
    expect(db.cameraPresetOperation.updateMany).toHaveBeenCalledWith({
      where: { id: operation.id, status: "pending", dispatchedAt: null },
      data: {
        status: "failed",
        error: expect.stringContaining("banned or timed out"),
      },
    });
    expect(banned).toHaveBeenCalledWith(operation.command.actor.id);
  },
);

test("a moderation outage leaves a queued load pending and never exposes dispatchable state", async () => {
  vi.useFakeTimers({ now: subscriber.expiresAt });
  banned.mockRejectedValue(new Error("secret upstream response"));
  await expect(getPresetOperation(id)).rejects.toMatchObject({
    code: "SERVICE_UNAVAILABLE",
    message:
      "Preset access verification is temporarily unavailable. Try again shortly.",
  });
  expect(db.cameraPresetOperation.updateMany).not.toHaveBeenCalled();
  expect(db.cameraPresetOperation.update).not.toHaveBeenCalled();
});

test("a load that expires during a moderation outage is failed instead of blocking its camera", async () => {
  vi.useFakeTimers({ now: subscriber.expiresAt.getTime() + 1 });
  banned.mockRejectedValue(new Error("unavailable"));
  db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue({
    ...subscriber,
    status: "failed",
  });
  expect(await getPresetOperation(id)).toMatchObject({ status: "failed" });
  expect(db.cameraPresetOperation.updateMany).toHaveBeenCalledWith({
    where: { id, status: "pending", dispatchedAt: null },
    data: {
      status: "failed",
      error: expect.stringContaining("expired while chat ban verification"),
    },
  });
});

test.each(["completed", "failed"])(
  "terminal %s outcomes remain recoverable during moderation outages",
  async (status) => {
    db.cameraPresetOperation.findUnique.mockResolvedValue({
      ...subscriber,
      status,
    });
    banned.mockRejectedValue(new Error("unavailable"));
    expect(await getPresetOperation(id)).toMatchObject({ status });
    expect(banned).not.toHaveBeenCalled();
  },
);

test("pausing cancels only pending subscriber loads and records the server operator identity", async () => {
  db.cameraPresetOperation.findMany.mockResolvedValue([subscriber, operator]);
  db.cameraPresetPolicy.update.mockResolvedValue({
    scope: "camera:garden",
    paused: true,
    resumeAt: null,
  });
  expect(
    await setSubscriberPolicy(
      { camera: "garden", paused: true },
      "operator-id",
    ),
  ).toMatchObject({ scope: "camera:garden", paused: true });
  expect(db.cameraPresetPolicy.update).toHaveBeenCalledWith({
    where: { scope: "camera:garden" },
    data: { paused: true, resumeAt: null, updatedBy: "operator-id" },
  });
  expect(db.cameraPresetOperation.updateMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        id: { in: [subscriber.id] },
        status: "pending",
        dispatchedAt: null,
      },
    }),
  );
});

test.each([
  { paused: true, resumeAt: new Date(Date.now() - 1000).toISOString() },
  { paused: true, resumeAt: new Date(Date.now() + 8 * 86400000).toISOString() },
  { paused: false, resumeAt: new Date(Date.now() + 60000).toISOString() },
])(
  "invalid or misleading timed pauses are rejected before a database write: %j",
  async (input) => {
    await expect(
      setSubscriberPolicy(input, "operator-id"),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(db.$transaction).not.toHaveBeenCalled();
  },
);

test("a pause before dispatch denies the claim without moving", async () => {
  expect(await claimPresetLoad(id)).toMatchObject({
    claimed: false,
    operation: { status: "failed", error: expect.stringContaining("paused") },
  });
});

test("a successful claim is durable and cannot be granted twice", async () => {
  db.cameraPresetPolicy.findMany.mockResolvedValue([
    { scope: "global", paused: false, resumeAt: null },
  ]);
  expect(await claimPresetLoad(id)).toMatchObject({
    claimed: true,
    operation: { status: "pending" },
  });
  const claimed = { ...subscriber, dispatchedAt: new Date() };
  db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue(claimed);
  db.cameraPresetOperation.findUnique.mockResolvedValue(claimed);
  db.cameraPresetPolicy.findMany.mockResolvedValue([
    { scope: "global", paused: true, resumeAt: null },
  ]);
  db.cameraPresetOperation.update.mockClear();
  expect(await claimPresetLoad(id)).toMatchObject({ claimed: false });
  expect(await getPresetOperation(id)).toMatchObject({ status: "pending" });
  expect(db.cameraPresetOperation.update).not.toHaveBeenCalled();
});

test.each([true, new Error("unavailable")])(
  "a claimed load may already have moved, so its ban recheck is skipped: %s",
  async (ban) => {
    if (ban instanceof Error) banned.mockRejectedValue(ban);
    else banned.mockResolvedValue(ban);
    db.cameraPresetOperation.findUnique.mockResolvedValue({
      ...subscriber,
      dispatchedAt: new Date(),
    });
    expect(await getPresetOperation(id)).toMatchObject({ status: "pending" });
    expect(banned).not.toHaveBeenCalled();
    expect(db.cameraPresetOperation.updateMany).not.toHaveBeenCalled();
  },
);

test("expired loads cannot acquire a dispatch claim", async () => {
  db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue({
    ...subscriber,
    expiresAt: new Date(0),
  });
  expect(await claimPresetLoad(id)).toMatchObject({
    claimed: false,
    operation: { status: "failed", error: expect.stringContaining("expired") },
  });
});

test("operators can claim while subscriber controls are paused", async () => {
  db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue(operator);
  expect(await claimPresetLoad(operator.id)).toMatchObject({ claimed: true });
});
