import { createHash, randomUUID } from "node:crypto";

import { afterAll, describe, expect, test, vi } from "vitest";

import { prisma } from "@alveusgg/database";

import { setSubscriberPolicy } from "@/server/presets/policy";
import { type CaptureMetadata } from "@/server/presets/schema";
import {
  commandPreset,
  commitPresetCapture,
  completePresetOperation,
  getPresetOperation,
  pendingPresetOperations,
  preparePresetCapture,
} from "@/server/presets/service";
import { deleteFileStorageObject } from "@/server/utils/file-storage";

// Explicit opt-in only. These tests may write solely to the isolated local test database/bucket.
const database = process.env.PRESET_INTEGRATION_DATABASE_URL;
const storage = process.env.PRESET_INTEGRATION_STORAGE_URL;
const enabled = Boolean(database && storage);
if (enabled) {
  const dbUrl = new URL(database!);
  const storageUrl = new URL(storage!);
  if (
    !["localhost", "127.0.0.1"].includes(dbUrl.hostname) ||
    dbUrl.pathname !== "/alveusgg_presets" ||
    !["localhost", "127.0.0.1"].includes(storageUrl.hostname)
  )
    throw new Error(
      "Preset integration tests require the isolated local database and S3 endpoint",
    );
  process.env.DATABASE_URL = database;
}
vi.mock("@/env", () => ({
  env: {
    FILE_STORAGE_ENDPOINT:
      process.env.PRESET_INTEGRATION_STORAGE_URL ?? "http://127.0.0.1:9000",
    FILE_STORAGE_REGION: "us-east-1",
    FILE_STORAGE_BUCKET: "alveusgg",
    FILE_STORAGE_KEY: "alveusgg_key",
    FILE_STORAGE_SECRET: "alveusgg_secret",
    FILE_STORAGE_PATH_STYLE: true,
  },
}));
vi.mock("@/server/oauth/tokens", () => ({ issueAccessToken: vi.fn() }));

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=",
  "base64",
);
const cameras: string[] = [];
const cooldownUsers: string[] = [];
function rateUser() {
  const id = `integration-${randomUUID()}`;
  cooldownUsers.push(id);
  return id;
}
function camera() {
  const value = `integration-${randomUUID().slice(0, 8)}`;
  cameras.push(value);
  return value;
}
async function save(camera: string, name = "home") {
  const operation = await commandPreset({
    id: randomUUID(),
    action: "save",
    camera,
    name,
    actor: { id: "local-integration" },
  });
  const capture: CaptureMetadata = {
    id: operation.id,
    camera,
    position: {
      pan: 12,
      tilt: -3,
      zoom: 1,
      focus: 123,
      autofocus: "off",
      brightness: 5000,
      autoiris: "on",
    },
    sha256: createHash("sha256").update(png).digest("hex"),
    size: png.length,
    contentType: "image/png",
    capturedAt: new Date(Date.parse(operation.createdAt) + 1).toISOString(),
  };
  return { operation, capture };
}
async function upload(
  prepared: Awaited<ReturnType<typeof preparePresetCapture>>,
  bytes = png,
) {
  if (prepared.delivered) throw new Error("Expected upload session");
  const response = await fetch(prepared.uploadUrl, {
    method: "PUT",
    headers: prepared.headers,
    body: new Uint8Array(bytes),
  });
  expect(response.ok).toBe(true);
}

describe.skipIf(!enabled)(
  "preset backend against isolated MySQL and S3",
  () => {
    afterAll(async () => {
      const captures = await prisma.presetCapture.findMany({
        where: {
          operationId: {
            in: (
              await prisma.cameraPresetOperation.findMany({
                where: { camera: { in: cameras } },
                select: { id: true },
              })
            ).map(({ id }) => id),
          },
        },
      });
      await prisma.cameraPreset.deleteMany({
        where: { camera: { in: cameras } },
      });
      await prisma.presetCapture.deleteMany({
        where: { id: { in: captures.map(({ id }) => id) } },
      });
      await prisma.cameraPresetOperation.deleteMany({
        where: { camera: { in: cameras } },
      });
      await prisma.cameraPresetPolicy.deleteMany({
        where: { scope: { in: cameras.map((camera) => `camera:${camera}`) } },
      });
      await prisma.cameraPresetCooldown.deleteMany({
        where: {
          key: {
            in: [
              ...cameras.map((camera) => `camera:${camera}`),
              ...cooldownUsers.map((user) => `user:${user}`),
            ],
          },
        },
      });
      await prisma.cameraPresetName.deleteMany({
        where: { camera: { in: cameras } },
      });
      await prisma.cameraPresetCamera.deleteMany({
        where: { camera: { in: cameras } },
      });
      for (const capture of captures) {
        await deleteFileStorageObject(capture.fileStorageObjectId);
        await prisma.imageMetadata.deleteMany({
          where: { fileStorageObjectId: capture.fileStorageObjectId },
        });
        await prisma.fileStorageObject.delete({
          where: { id: capture.fileStorageObjectId },
        });
      }
      await prisma.$disconnect();
    });

    test("concurrent command, prepare and commit retries publish exactly one verified preset and capture", async () => {
      const cam = camera();
      const command = {
        id: randomUUID(),
        action: "save" as const,
        camera: cam,
        name: "home",
        actor: { id: "local-integration" },
      };
      const results = await Promise.all([
        commandPreset(command),
        commandPreset(command),
      ]);
      expect(results[0]?.id).toBe(results[1]?.id);
      const operation = results[0]!;
      const capture: CaptureMetadata = {
        id: operation.id,
        camera: cam,
        position: { pan: 0, tilt: 0, zoom: 1 },
        sha256: createHash("sha256").update(png).digest("hex"),
        size: png.length,
        contentType: "image/png",
        capturedAt: new Date(Date.parse(operation.createdAt) + 1).toISOString(),
      };
      const prepared = await Promise.all([
        preparePresetCapture(operation.id, capture),
        preparePresetCapture(operation.id, capture),
      ]);
      if (prepared[0]!.delivered || prepared[1]!.delivered)
        throw new Error("Unexpected delivered capture");
      expect(new URL(prepared[0]!.uploadUrl).pathname).toBe(
        new URL(prepared[1]!.uploadUrl).pathname,
      );
      await upload(prepared[0]!);
      const committed = await Promise.all([
        commitPresetCapture(operation.id, capture.id),
        commitPresetCapture(operation.id, capture.id),
      ]);
      expect(
        committed.map(({ delivered, status }) => ({ delivered, status })),
      ).toEqual([
        { delivered: true, status: "completed" },
        { delivered: true, status: "completed" },
      ]);
      expect(await prisma.cameraPreset.count({ where: { camera: cam } })).toBe(
        1,
      );
      expect(
        await prisma.presetCapture.count({
          where: { operationId: operation.id },
        }),
      ).toBe(1);
      expect(
        await prisma.cameraPresetOperation.count({
          where: { id: operation.id },
        }),
      ).toBe(1);
      await expect(
        commandPreset({ ...command, name: "other" }),
      ).rejects.toMatchObject({ code: "CONFLICT" });
    }, 30000);

    test("clear fences an in-flight save while preserving a durable capture receipt", async () => {
      const cam = camera();
      const { operation, capture } = await save(cam);
      await commandPreset({
        id: randomUUID(),
        action: "clear",
        camera: cam,
        actor: { id: "local-integration" },
      });
      await upload(await preparePresetCapture(operation.id, capture));
      expect(await commitPresetCapture(operation.id, capture.id)).toMatchObject(
        { delivered: true, status: "failed" },
      );
      expect(await prisma.cameraPreset.count({ where: { camera: cam } })).toBe(
        0,
      );
      expect(await preparePresetCapture(operation.id, capture)).toEqual({
        delivered: true,
      });
    }, 30000);

    test("a retained capture from a failed operation is archived without restoring its preset", async () => {
      const cam = camera();
      const { operation, capture } = await save(cam);
      await completePresetOperation({
        id: operation.id,
        status: "failed",
        error: "Local simulated timeout",
      });
      await upload(await preparePresetCapture(operation.id, capture));
      expect(await commitPresetCapture(operation.id, capture.id)).toMatchObject(
        { delivered: true, status: "failed" },
      );
      expect(await prisma.cameraPreset.count({ where: { camera: cam } })).toBe(
        0,
      );
      expect(
        (
          await prisma.presetCapture.findUniqueOrThrow({
            where: { id: capture.id },
          })
        ).deliveredAt,
      ).not.toBeNull();
    }, 30000);

    test("different pending preset names publish independently on one camera", async () => {
      const cam = camera();
      const first = await save(cam, "home");
      const second = await save(cam, "other");
      for (const { operation, capture } of [first, second]) {
        await upload(await preparePresetCapture(operation.id, capture));
        expect(
          await commitPresetCapture(operation.id, capture.id),
        ).toMatchObject({ delivered: true, status: "completed" });
      }
      expect(
        await prisma.cameraPreset.count({
          where: { camera: cam, deletedAt: null },
        }),
      ).toBe(2);
    }, 30000);

    test("a later same-name save fences an earlier pending capture", async () => {
      const cam = camera();
      const first = await save(cam);
      const second = await save(cam);
      await upload(
        await preparePresetCapture(first.operation.id, first.capture),
      );
      expect(
        await commitPresetCapture(first.operation.id, first.capture.id),
      ).toMatchObject({ delivered: true, status: "failed" });
      await upload(
        await preparePresetCapture(second.operation.id, second.capture),
      );
      expect(
        await commitPresetCapture(second.operation.id, second.capture.id),
      ).toMatchObject({ delivered: true, status: "completed" });
      expect(
        await prisma.cameraPreset.count({
          where: { camera: cam, deletedAt: null },
        }),
      ).toBe(1);
    }, 30000);

    test("rename retains identity and fences both name slots; subsequent removal cannot be resurrected", async () => {
      const cam = camera();
      const initial = await save(cam);
      await upload(
        await preparePresetCapture(initial.operation.id, initial.capture),
      );
      await commitPresetCapture(initial.operation.id, initial.capture.id);
      const original = await prisma.cameraPreset.findUniqueOrThrow({
        where: { camera_name: { camera: cam, name: "home" } },
      });
      const oldSlot = await save(cam, "home");
      const targetSlot = await save(cam, "renamed");
      await commandPreset({
        id: randomUUID(),
        action: "rename",
        camera: cam,
        name: "home",
        newName: "renamed",
        actor: { id: "local-integration" },
      });
      expect(
        (
          await prisma.cameraPreset.findUniqueOrThrow({
            where: { camera_name: { camera: cam, name: "renamed" } },
          })
        ).id,
      ).toBe(original.id);
      await commandPreset({
        id: randomUUID(),
        action: "remove",
        camera: cam,
        name: "renamed",
        actor: { id: "local-integration" },
      });
      for (const { operation, capture } of [oldSlot, targetSlot]) {
        await upload(await preparePresetCapture(operation.id, capture));
        expect(
          await commitPresetCapture(operation.id, capture.id),
        ).toMatchObject({ delivered: true, status: "failed" });
      }
      expect(
        await prisma.cameraPreset.count({
          where: { camera: cam, deletedAt: null },
        }),
      ).toBe(0);
    }, 30000);

    test("renaming onto an existing preset rejects without replacing either identity", async () => {
      const cam = camera();
      for (const name of ["home", "occupied"]) {
        const item = await save(cam, name);
        await upload(
          await preparePresetCapture(item.operation.id, item.capture),
        );
        await commitPresetCapture(item.operation.id, item.capture.id);
      }
      const before = await prisma.cameraPreset.findMany({
        where: { camera: cam },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
      await expect(
        commandPreset({
          id: randomUUID(),
          action: "rename",
          camera: cam,
          name: "home",
          newName: "occupied",
          actor: { id: "local-integration" },
        }),
      ).rejects.toMatchObject({ code: "CONFLICT" });
      expect(
        await prisma.cameraPreset.findMany({
          where: { camera: cam },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
      ).toEqual(before);
    }, 30000);

    test("durable cooldowns serialize users across cameras and retry the original UUID without charging again", async () => {
      const firstCamera = camera();
      const secondCamera = camera();
      const actorId = rateUser();
      for (const cam of [firstCamera, secondCamera])
        await prisma.cameraPreset.create({
          data: {
            camera: cam,
            name: "home",
            description: "Home",
            position: { pan: 0, tilt: 0, zoom: 1 },
            provenance: "control-api-import",
          },
        });
      const commands = [firstCamera, secondCamera].map((camera) => ({
        id: randomUUID(),
        action: "load" as const,
        camera,
        name: "home",
        authorization: "operator" as const,
        actor: { id: actorId, name: "Old Name" },
      }));
      const results = await Promise.allSettled(
        commands.map((command) =>
          commandPreset(command, { cooldownUserId: actorId }),
        ),
      );
      expect(
        results.filter(({ status }) => status === "fulfilled"),
      ).toHaveLength(1);
      expect(
        results
          .filter(({ status }) => status === "rejected")
          .map((result) =>
            result.status === "rejected" ? result.reason.code : null,
          ),
      ).toEqual(["TOO_MANY_REQUESTS"]);
      const winnerIndex = results.findIndex(
        ({ status }) => status === "fulfilled",
      );
      const accepted = commands[winnerIndex]!;
      const keys = [`user:${actorId}`, `camera:${accepted.camera}`];
      const before = await prisma.cameraPresetCooldown.findMany({
        where: { key: { in: keys } },
        orderBy: { key: "asc" },
      });
      expect(
        await commandPreset(
          {
            ...accepted,
            authorization: undefined,
            actor: { id: actorId, name: "New Name" },
          },
          { cooldownUserId: actorId },
        ),
      ).toMatchObject({ id: accepted.id });
      expect(
        await prisma.cameraPresetCooldown.findMany({
          where: { key: { in: keys } },
          orderBy: { key: "asc" },
        }),
      ).toEqual(before);
      const foreign = rateUser();
      await expect(
        commandPreset(
          { ...accepted, actor: { id: foreign } },
          { cooldownUserId: foreign },
        ),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(
        commandPreset(
          { ...accepted, id: randomUUID(), actor: { id: foreign } },
          { cooldownUserId: foreign },
        ),
      ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
      expect(
        await prisma.cameraPresetCooldown.findUnique({
          where: { key: `user:${foreign}` },
        }),
      ).toBeNull();
    }, 30000);

    test("two subscribers/operators cannot concurrently bypass one camera's durable cooldown", async () => {
      const cam = camera();
      const users = [rateUser(), rateUser()];
      await prisma.cameraPreset.create({
        data: {
          camera: cam,
          name: "home",
          description: "Home",
          position: { pan: 0, tilt: 0, zoom: 1 },
          provenance: "control-api-import",
        },
      });
      const results = await Promise.allSettled(
        users.map((id) =>
          commandPreset(
            {
              id: randomUUID(),
              action: "load",
              camera: cam,
              name: "home",
              authorization: "operator",
              actor: { id },
            },
            { cooldownUserId: id },
          ),
        ),
      );
      expect(
        results.filter(({ status }) => status === "fulfilled"),
      ).toHaveLength(1);
      expect(
        results
          .filter(({ status }) => status === "rejected")
          .map((result) =>
            result.status === "rejected" ? result.reason.code : null,
          ),
      ).toEqual(["TOO_MANY_REQUESTS"]);
    }, 30000);

    test("a concurrent subscriber pause/load is serialized and later dispatch rechecks the paused policy", async () => {
      const originalGlobal = await prisma.cameraPresetPolicy.findUnique({
        where: { scope: "global" },
      });
      const cam = camera();
      const userId = rateUser();
      try {
        await prisma.cameraPresetPolicy.upsert({
          where: { scope: "global" },
          create: {
            scope: "global",
            paused: false,
            updatedBy: "local-integration",
          },
          update: { paused: false, resumeAt: null },
        });
        await prisma.cameraPreset.create({
          data: {
            camera: cam,
            name: "home",
            description: "Home",
            position: { pan: 0, tilt: 0, zoom: 1 },
            provenance: "control-api-import",
          },
        });
        await setSubscriberPolicy(
          { camera: cam, paused: false },
          "local-integration",
        );
        const command = {
          id: randomUUID(),
          action: "load" as const,
          camera: cam,
          name: "home",
          authorization: "subscriber" as const,
          actor: { id: userId },
        };
        const [load, pause] = await Promise.allSettled([
          commandPreset(command, { cooldownUserId: userId }),
          setSubscriberPolicy(
            { camera: cam, paused: true },
            "local-integration",
          ),
        ]);
        expect(pause.status).toBe("fulfilled");
        if (load.status === "fulfilled")
          expect(await getPresetOperation(command.id)).toMatchObject({
            status: "failed",
            error: expect.stringContaining("paused"),
          });
        else expect(load.reason).toMatchObject({ code: "FORBIDDEN" });
        // Simulate a retained pending row discovered after the policy was changed.
        const delayedId = randomUUID();
        await prisma.cameraPresetOperation.create({
          data: {
            id: delayedId,
            action: "load",
            camera: cam,
            status: "pending",
            commandHash: "b".repeat(64),
            command: { ...command, id: delayedId },
            expectedCameraVersion: 0,
            expiresAt: new Date(Date.now() + 15000),
          },
        });
        expect(await getPresetOperation(delayedId)).toMatchObject({
          status: "failed",
          error: expect.stringContaining("paused"),
        });
        // Operator loads bypass pause, while using the same authoritative preset data.
        expect(
          await commandPreset({
            ...command,
            id: randomUUID(),
            authorization: "operator",
            actor: { id: "local-operator" },
          }),
        ).toMatchObject({ status: "pending" });
      } finally {
        if (originalGlobal)
          await prisma.cameraPresetPolicy.update({
            where: { scope: "global" },
            data: originalGlobal,
          });
        else
          await prisma.cameraPresetPolicy.deleteMany({
            where: { scope: "global" },
          });
      }
    }, 30000);

    test("pending recovery paginates tied timestamps and survives a deleted cursor row", async () => {
      const cam = camera();
      const timestamp = new Date();
      const ids = Array.from({ length: 102 }, () => randomUUID()).sort();
      await prisma.cameraPresetOperation.createMany({
        data: ids.map((id, index) => ({
          id,
          camera: cam,
          action: "save",
          status: "pending",
          commandHash: "a".repeat(64),
          command: {
            id,
            camera: cam,
            action: "save",
            name: `page-${index}`,
            actor: { id: "local-integration" },
          },
          expectedCameraVersion: 0,
          createdAt: timestamp,
          expiresAt: new Date(timestamp.getTime() + 15000),
        })),
      });
      // Other local E2E operations may exist; start just before this fixture's timestamp.
      const before = {
        createdAt: new Date(timestamp.getTime() - 1).toISOString(),
        id: "ffffffff-ffff-4fff-bfff-ffffffffffff",
      };
      const first = await pendingPresetOperations(before);
      expect(first).toHaveLength(100);
      expect(first.map(({ id }) => id)).toEqual(ids.slice(0, 100));
      const cursor = first[99]!;
      await prisma.cameraPresetOperation.delete({ where: { id: cursor.id } });
      const next = await pendingPresetOperations({
        createdAt: cursor.createdAt,
        id: cursor.id,
      });
      expect(next.map(({ id }) => id)).toEqual(ids.slice(100));
    }, 30000);

    test("a mismatched actual object checksum cannot finalize the upload", async () => {
      const cam = camera();
      const { operation, capture } = await save(cam);
      const corrupted = Buffer.from(png);
      corrupted[0] = 0;
      await upload(
        await preparePresetCapture(operation.id, capture),
        corrupted,
      );
      await expect(
        commitPresetCapture(operation.id, capture.id),
      ).rejects.toThrow("checksum");
      expect(
        (
          await prisma.presetCapture.findUniqueOrThrow({
            where: { id: capture.id },
          })
        ).deliveredAt,
      ).toBeNull();
      expect(await prisma.cameraPreset.count({ where: { camera: cam } })).toBe(
        0,
      );
    }, 30000);
  },
);
