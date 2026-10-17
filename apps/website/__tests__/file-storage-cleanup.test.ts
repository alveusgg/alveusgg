import type * as S3Module from "@aws-sdk/client-s3";
import { beforeEach, expect, test, vi } from "vitest";

import { cleanupFileStorage } from "@/server/file-storage/cleanup";
import { deleteExpiredFileStorageObject } from "@/server/utils/file-storage";

const { db, send } = vi.hoisted(() => ({
  db: {
    $executeRaw: vi.fn(),
    fileStorageObject: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
  send: vi.fn(),
}));
vi.mock("@alveusgg/database", () => ({ prisma: db }));
vi.mock("@/env", () => ({
  env: {
    FILE_STORAGE_ENDPOINT: "http://127.0.0.1:9000",
    FILE_STORAGE_KEY: "mock",
    FILE_STORAGE_SECRET: "mock",
    FILE_STORAGE_REGION: "us-east-1",
    FILE_STORAGE_BUCKET: "mock",
  },
}));
vi.mock("@aws-sdk/client-s3", async (original) => ({
  ...(await original<typeof S3Module>()),
  S3Client: class {
    send = send;
  },
}));
beforeEach(() => {
  vi.resetAllMocks();
  db.fileStorageObject.findUniqueOrThrow.mockResolvedValue({
    key: "expired.png",
  });
  db.$executeRaw.mockResolvedValue(1);
  send.mockResolvedValue({});
});

test("stale cleanup selection cannot delete an object already claimed for publication", async () => {
  db.$executeRaw.mockResolvedValue(0);
  await deleteExpiredFileStorageObject("published", new Date());
  expect(send).not.toHaveBeenCalled();
  expect(db.fileStorageObject.update).not.toHaveBeenCalled();
});

test("cleanup claims the database row before deleting its object", async () => {
  await deleteExpiredFileStorageObject("expired", new Date());
  expect(db.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(
    send.mock.invocationCallOrder[0]!,
  );
  expect(send.mock.invocationCallOrder[0]).toBeLessThan(
    db.fileStorageObject.update.mock.invocationCallOrder[0]!,
  );
  const [sql, ...values] = db.$executeRaw.mock.calls[0]!;
  expect(sql.join("?")).toContain("WHERE id = ? AND expiresAt < ?");
  expect(values).toEqual([expect.any(Date), "expired", expect.any(Date)]);
  expect(db.fileStorageObject.update).toHaveBeenCalledWith({
    where: { id: "expired" },
    data: { expiresAt: null },
  });
});

test("an interrupted deletion keeps its expiry and is eligible for a later cleanup retry", async () => {
  // Object deletion may fail after the database tombstone was committed.
  const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
  send.mockRejectedValueOnce(new Error("storage unavailable"));
  await expect(
    deleteExpiredFileStorageObject("expired", new Date()),
  ).rejects.toThrow("Failed to delete expired");
  expect(db.fileStorageObject.update).not.toHaveBeenCalled();
  db.fileStorageObject.findMany.mockResolvedValue([{ id: "expired" }]);
  await cleanupFileStorage({ maxItems: 10 });
  expect(db.fileStorageObject.findMany).toHaveBeenCalledWith({
    select: { id: true },
    where: { expiresAt: { lt: expect.any(Date) } },
    take: 10,
  });
  expect(send).toHaveBeenCalledTimes(2);
  expect(db.fileStorageObject.update).toHaveBeenCalled();
  errorLog.mockRestore();
});
