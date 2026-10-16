import { beforeEach, expect, test, vi } from "vitest";

import type * as DatabaseModule from "@alveusgg/database";

import {
  effectiveSubscriberPolicy,
  setSubscriberPolicy,
} from "@/server/presets/policy";
import { getPresetOperation } from "@/server/presets/service";

const { db } = vi.hoisted(() => ({
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
  preset: null,
  result: null,
  error: null,
  createdAt: now,
  updatedAt: now,
  expiresAt: new Date(now.getTime() + 15000),
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
});

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
      where: { id: { in: [subscriber.id] }, status: "pending" },
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
