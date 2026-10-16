import { createHash, randomUUID } from "node:crypto";

import { beforeEach, expect, test, vi } from "vitest";

import { type CaptureMetadata } from "@/server/presets/schema";
import { verifyCaptureUpload } from "@/server/presets/storage";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("@/env", () => ({
  env: { FILE_STORAGE_BUCKET: "local-presets-test" },
}));
vi.mock("@/server/utils/file-storage", () => ({
  getFileStorageClient: () => ({ send }),
}));
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWZkAAAAASUVORK5CYII=",
  "base64",
);
const metadata: CaptureMetadata = {
  id: randomUUID(),
  camera: "garden",
  position: { pan: 0, tilt: 0, zoom: 1 },
  sha256: createHash("sha256").update(png).digest("hex"),
  size: png.length,
  contentType: "image/png",
  capturedAt: "2026-10-16T10:00:00.000Z",
};
function object(
  bytes: Buffer,
  type = "image/png",
  declaredSize = bytes.length,
) {
  return {
    ContentLength: declaredSize,
    ContentType: type,
    Body: (async function* () {
      yield bytes.subarray(0, 10);
      yield bytes.subarray(10);
    })(),
  };
}
beforeEach(() => send.mockReset());

test("checks bytes from the configured bucket and extracts actual image dimensions", async () => {
  send.mockResolvedValue(object(png));
  expect(
    await verifyCaptureUpload("presets/captures/test.png", metadata),
  ).toEqual({ width: 1, height: 1, mimeType: "image/png" });
  expect(send.mock.calls[0]?.[0].input).toMatchObject({
    Bucket: "local-presets-test",
    Key: "presets/captures/test.png",
  });
});

test("rejects a corrupted upload whose advertised length and MIME still match", async () => {
  const corrupt = Buffer.from(png);
  corrupt[corrupt.length - 1] = (corrupt[corrupt.length - 1] ?? 0) ^ 1;
  send.mockResolvedValue(object(corrupt));
  await expect(verifyCaptureUpload("test", metadata)).rejects.toThrow(
    "checksum",
  );
});

test("rejects valid PNG bytes advertised as JPEG even with a valid checksum", async () => {
  send.mockResolvedValue(object(png, "image/jpeg"));
  await expect(
    verifyCaptureUpload("test", { ...metadata, contentType: "image/jpeg" }),
  ).rejects.toThrow("Invalid capture image");
});

test("rejects a body that exceeds its declared length instead of buffering it indefinitely", async () => {
  send.mockResolvedValue(
    object(Buffer.concat([png, png]), "image/png", png.length),
  );
  await expect(verifyCaptureUpload("test", metadata)).rejects.toThrow(
    "declared size",
  );
});
