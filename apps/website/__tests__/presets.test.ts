import { randomUUID } from "node:crypto";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  captureMatchesOperation,
  captureSchema,
  commandSchema,
  payloadHash,
} from "@/server/presets/schema";
import {
  commandPreset,
  commitPresetCapture,
  completePresetOperation,
  preparePresetCapture,
  presetCatalog,
} from "@/server/presets/service";

const { db, verifyUpload, createUpload, signUpload, testEnv, dispatchFetch } =
  vi.hoisted(() => {
    const db = {
      $transaction: vi.fn(),
      $executeRaw: vi.fn(),
      cameraPresetCamera: {
        upsert: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
      },
      cameraPresetCooldown: { createMany: vi.fn(), updateMany: vi.fn() },
      cameraPresetName: { upsert: vi.fn(), findUnique: vi.fn() },
      cameraPresetOperation: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      cameraPreset: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      presetCapture: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      fileStorageObject: { update: vi.fn() },
      imageMetadata: { upsert: vi.fn() },
    };
    return {
      db,
      verifyUpload: vi.fn(),
      createUpload: vi.fn(),
      signUpload: vi.fn(),
      testEnv: { CAM_MANAGER_URL: undefined as string | undefined },
      dispatchFetch: vi.fn(),
    };
  });
vi.mock("@alveusgg/database", () => ({ prisma: db }));
vi.mock("@/env", () => ({ env: testEnv }));
vi.mock("@/server/oauth/tokens", () => ({ issueAccessToken: vi.fn() }));
vi.mock("@/server/presets/storage", () => ({
  stageVerifiedCaptureUpload: verifyUpload,
}));
vi.mock("@/server/utils/file-storage", () => ({
  createFileStorageUpload: createUpload,
  renewFileStorageUpload: signUpload,
  getViewUrlForFileStorageObjectKey: (key: string) => `http://localhost/${key}`,
}));

const now = new Date("2026-10-16T10:00:00.000Z");
const id = "aeef07fa-ea5c-4fd2-bbcb-8f60d67ff38b";
const command = {
  id,
  action: "save" as const,
  camera: "garden",
  name: "home",
  actor: { id: "123" },
};
const capture = {
  id,
  camera: "garden",
  position: { pan: 1, tilt: 2, zoom: 1, focus: 10, autofocus: "off" as const },
  sha256: "a".repeat(64),
  size: 100,
  contentType: "image/jpeg" as const,
  capturedAt: "2026-10-16T10:00:01.000Z",
};
const operation = {
  id,
  action: "save",
  camera: "garden",
  command,
  commandHash: payloadHash(command),
  expectedCameraVersion: 1,
  expectedNameVersion: 1,
  status: "pending",
  preset: null,
  result: null,
  error: null,
  createdAt: now,
  updatedAt: now,
  expiresAt: new Date(now.getTime() + 15000),
};
const file = {
  id: "file-1",
  key: "presets/captures/file.jpg",
  type: "image/jpeg",
  deletedAt: null,
  expiresAt: new Date("2099-01-01T00:00:00Z"),
};
const publishedFile = {
  ...file,
  id: "published-file",
  key: "presets/published/file.jpg",
};
const savedCapture = {
  id,
  operationId: id,
  metadata: capture,
  metadataHash: payloadHash(capture),
  fileStorageObjectId: file.id,
  fileStorageObject: file,
  deliveredAt: null,
};

beforeEach(() => {
  vi.resetAllMocks();
  testEnv.CAM_MANAGER_URL = undefined;
  vi.stubGlobal("fetch", dispatchFetch);
  dispatchFetch.mockResolvedValue(new Response(null, { status: 200 }));
  db.$executeRaw.mockResolvedValue(1);
  db.$transaction.mockImplementation(async (fn) => fn(db));
  db.cameraPresetCamera.findUniqueOrThrow.mockResolvedValue({
    camera: "garden",
    version: 1,
  });
  db.cameraPresetName.findUnique.mockResolvedValue({
    camera: "garden",
    name: "home",
    version: 1,
  });
  db.cameraPresetName.upsert.mockResolvedValue({
    camera: "garden",
    name: "home",
    version: 1,
  });
  db.cameraPresetCamera.update.mockResolvedValue({
    camera: "garden",
    version: 1,
  });
  db.cameraPresetOperation.findUnique.mockResolvedValue(operation);
  db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue(operation);
  db.cameraPresetOperation.update.mockImplementation(async ({ data }) => ({
    ...operation,
    ...data,
  }));
  db.presetCapture.findUnique.mockResolvedValue(savedCapture);
  db.presetCapture.findUniqueOrThrow.mockResolvedValue(savedCapture);
  verifyUpload.mockResolvedValue({
    fileStorageObject: publishedFile,
    image: {
      width: 1920,
      height: 1080,
      mimeType: "image/jpeg",
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("durable preset commands", () => {
  test("a repeated command returns its existing result; UUID reuse for another payload conflicts", async () => {
    expect((await commandPreset(command)).id).toBe(id);
    expect(db.cameraPresetOperation.create).not.toHaveBeenCalled();
    await expect(
      commandPreset({ ...command, name: "other" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("UUID recovery ignores mutable display name and server authorization metadata without consuming another cooldown", async () => {
    db.cameraPresetOperation.findUnique.mockResolvedValue({
      ...operation,
      command: {
        ...command,
        authorization: "operator",
        actor: { id: "123", name: "Old Name" },
      },
    });
    expect(
      await commandPreset(
        { ...command, actor: { id: "123", name: "New Name" } },
        { cooldownUserId: "123" },
      ),
    ).toMatchObject({ id });
    expect(db.cameraPresetCooldown.createMany).not.toHaveBeenCalled();
    expect(db.cameraPresetCooldown.updateMany).not.toHaveBeenCalled();
  });

  test("another authenticated actor cannot reuse an existing operation UUID", async () => {
    await expect(
      commandPreset(
        { ...command, actor: { id: "foreign-user" } },
        { cooldownUserId: "foreign-user" },
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.cameraPresetCooldown.createMany).not.toHaveBeenCalled();
  });

  test("a genuinely missing preset has a distinct NOT_FOUND error", async () => {
    db.cameraPresetOperation.findUnique.mockResolvedValue(null);
    db.cameraPreset.findUnique.mockResolvedValue(null);
    await expect(
      commandPreset({ ...command, id: randomUUID(), action: "load" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("an unreconciled legacy preset cannot be loaded or masquerade as missing", async () => {
    db.cameraPresetOperation.findUnique.mockResolvedValue(null);
    db.cameraPreset.findUnique.mockResolvedValue({
      id: "legacy",
      provenance: "legacy",
      deletedAt: null,
    });
    await expect(
      commandPreset({ ...command, id: randomUUID(), action: "load" }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  test("terminal outcomes cannot be overwritten by late workers", async () => {
    db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue({
      ...operation,
      status: "completed",
      result: { captureId: id },
    });
    expect(
      (
        await completePresetOperation({
          id,
          status: "failed",
          error: "late timeout",
        })
      ).status,
    ).toBe("completed");
    expect(db.cameraPresetOperation.update).not.toHaveBeenCalled();
  });

  test("unknown load outcomes are durable and a UUID retry cannot dispatch them again", async () => {
    const load = {
      ...operation,
      action: "load",
      command: { ...command, action: "load" as const },
      preset: { id, version: 1, position: capture.position },
    };
    const error =
      "Load outcome unknown; it will not be automatically repeated.";
    db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue(load);
    expect(
      await completePresetOperation({ id, status: "unknown", error }),
    ).toMatchObject({ id, status: "unknown", error });
    expect(db.cameraPresetOperation.update).toHaveBeenCalledWith({
      where: { id },
      data: { status: "unknown", error },
    });
    const settled = { ...load, status: "unknown", error };
    db.cameraPresetOperation.findUnique.mockResolvedValue(settled);
    db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue(settled);
    expect(await commandPreset(load.command)).toMatchObject({
      id,
      status: "unknown",
      error,
    });
    expect(
      await completePresetOperation({ id, status: "completed" }),
    ).toMatchObject({ status: "unknown", error });
    expect(db.cameraPresetOperation.create).not.toHaveBeenCalled();
    expect(dispatchFetch).not.toHaveBeenCalled();
  });
});

describe("capture delivery and publication", () => {
  test("capture identity, camera and original capture window are bound to its operation", async () => {
    for (const invalid of [
      { ...capture, id: randomUUID() },
      { ...capture, camera: "fox" },
      { ...capture, capturedAt: "2026-10-16T10:00:16.000Z" },
    ])
      await expect(preparePresetCapture(id, invalid)).rejects.toMatchObject({
        code: "CONFLICT",
      });
    expect(createUpload).not.toHaveBeenCalled();
    expect(captureMatchesOperation(capture, operation)).toBe(true);
  });

  test("delivered replay returns a receipt even after the operation failed, without recapture or upload", async () => {
    db.cameraPresetOperation.findUnique.mockResolvedValue({
      ...operation,
      status: "failed",
    });
    db.presetCapture.findUnique.mockResolvedValue({
      ...savedCapture,
      deliveredAt: now,
    });
    expect(await preparePresetCapture(id, capture)).toEqual({
      delivered: true,
    });
    expect((await commitPresetCapture(id, id)).delivered).toBe(true);
    expect(createUpload).not.toHaveBeenCalled();
    expect(verifyUpload).not.toHaveBeenCalled();
  });

  test("a newer mutation fences publication but still durably acknowledges the obsolete capture", async () => {
    db.cameraPresetCamera.findUniqueOrThrow.mockResolvedValue({
      camera: "garden",
      version: 2,
    });
    const result = await commitPresetCapture(id, id);
    expect(result).toMatchObject({ delivered: true, status: "failed" });
    expect(db.presetCapture.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        deliveredAt: expect.any(Date),
        fileStorageObjectId: publishedFile.id,
      },
    });
    expect(db.cameraPreset.upsert).not.toHaveBeenCalled();
    const [sql, ...values] = db.$executeRaw.mock.calls[0]!;
    expect(sql.join("?")).toContain("AND deletedAt IS NULL AND expiresAt > ?");
    expect(values).toEqual([
      expect.any(Date),
      publishedFile.id,
      expect.any(Date),
    ]);
  });

  test("a failed upload cannot publish, finalize or acknowledge delivery", async () => {
    verifyUpload.mockRejectedValue(new Error("checksum mismatch"));
    await expect(commitPresetCapture(id, id)).rejects.toThrow(
      "checksum mismatch",
    );
    expect(db.cameraPreset.upsert).not.toHaveBeenCalled();
    expect(db.presetCapture.update).not.toHaveBeenCalled();
    expect(db.fileStorageObject.update).not.toHaveBeenCalled();
  });

  test("a capture from an already failed save is archived without resurrecting a preset", async () => {
    db.cameraPresetOperation.findUniqueOrThrow.mockResolvedValue({
      ...operation,
      status: "failed",
    });
    expect(await commitPresetCapture(id, id)).toMatchObject({
      delivered: true,
      status: "failed",
    });
    expect(db.presetCapture.update).toHaveBeenCalled();
    expect(db.cameraPreset.upsert).not.toHaveBeenCalled();
  });

  test("metadata mutation after prepare is rejected even for a delivered capture", async () => {
    db.presetCapture.findUnique.mockResolvedValue({
      ...savedCapture,
      deliveredAt: now,
    });
    await expect(
      preparePresetCapture(id, { ...capture, sha256: "b".repeat(64) }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("only verified upload publication may complete save operations", async () => {
    await expect(
      completePresetOperation({ id, status: "completed" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

test("payload hashes ignore object ordering but retain distinct optical state", () => {
  expect(payloadHash({ b: 2, a: 1 })).toBe(payloadHash({ a: 1, b: 2 }));
  expect(payloadHash(capture)).not.toBe(
    payloadHash({
      ...capture,
      position: { ...capture.position, autofocus: "on" },
    }),
  );
  expect(
    commandSchema.safeParse({ ...command, action: "clear", name: undefined })
      .success,
  ).toBe(true);
  expect(
    captureSchema.safeParse({ ...capture, size: 11 * 1024 * 1024 }).success,
  ).toBe(false);
});

test("archived zero-zoom presets remain readable but cannot be captured or loaded", async () => {
  const position = { pan: 0, tilt: 0, zoom: 0 };
  db.cameraPreset.findMany.mockResolvedValue([
    {
      id: "archived",
      camera: "legacy:chin2",
      name: "home",
      position,
      provenance: "legacy",
      updatedAt: now,
      fileStorageObject: null,
    },
  ]);
  expect(await presetCatalog()).toMatchObject([{ position }]);
  expect(captureSchema.safeParse({ ...capture, position }).success).toBe(false);
  db.cameraPresetOperation.findUnique.mockResolvedValue(null);
  db.cameraPreset.findUnique.mockResolvedValue({
    id: "archived",
    position,
    provenance: "legacy",
    deletedAt: null,
  });
  await expect(
    commandPreset({ ...command, action: "load" }),
  ).rejects.toMatchObject({
    code: "PRECONDITION_FAILED",
  });
});

test("a pending UUID replay recovers intent without submitting another Worker job", async () => {
  testEnv.CAM_MANAGER_URL = "https://manager.test/";
  expect(await commandPreset(command)).toMatchObject({ id });
  expect(dispatchFetch).not.toHaveBeenCalled();
});

test("unique-key conflict recovery does not redispatch the winning pending UUID", async () => {
  testEnv.CAM_MANAGER_URL = "https://manager.test/";
  db.$transaction.mockRejectedValueOnce({ code: "P2002" });
  expect(await commandPreset(command)).toMatchObject({ id });
  expect(dispatchFetch).not.toHaveBeenCalled();
});

test("only creation submits a pending operation to the Worker", async () => {
  testEnv.CAM_MANAGER_URL = "https://manager.test/";
  db.cameraPresetOperation.findUnique.mockResolvedValueOnce(null);
  db.cameraPresetOperation.create.mockResolvedValueOnce(operation);
  expect(await commandPreset(command)).toMatchObject({ id });
  expect(dispatchFetch).toHaveBeenCalledTimes(1);
  expect(dispatchFetch).toHaveBeenCalledWith(
    new URL("https://manager.test/presets/jobs"),
    expect.objectContaining({ body: JSON.stringify({ operationId: id }) }),
  );
  expect(await commandPreset(command)).toMatchObject({ id });
  expect(dispatchFetch).toHaveBeenCalledTimes(1);
});

test("a cleanup claim prevents publication of its candidate without a delivery receipt", async () => {
  db.$executeRaw.mockResolvedValueOnce(0);
  await expect(commitPresetCapture(id, id)).rejects.toMatchObject({
    code: "CONFLICT",
  });
  expect(db.presetCapture.update).not.toHaveBeenCalled();
  expect(db.cameraPreset.upsert).not.toHaveBeenCalled();
});
