import { expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: {
    FILE_STORAGE_ENDPOINT: "http://127.0.0.1:9000",
    FILE_STORAGE_KEY: "mock",
    FILE_STORAGE_SECRET: "mock",
    FILE_STORAGE_REGION: "us-east-1",
    FILE_STORAGE_BUCKET: "mock-bucket",
    FILE_STORAGE_PATH_STYLE: true,
  },
}));
vi.mock("@alveusgg/database", () => ({ prisma: {} }));

it("presigns an unknown upload body without an empty-body checksum", async () => {
  const { renewFileStorageUpload } =
    await import("../src/server/utils/file-storage");
  const url = new URL(
    await renewFileStorageUpload("presets/captures/test.png", "image/png"),
  );
  expect(
    [...url.searchParams.keys()].filter((key) =>
      key.toLowerCase().startsWith("x-amz-checksum"),
    ),
  ).toEqual([]);
  const headers = url.searchParams.get("X-Amz-SignedHeaders")?.split(";") ?? [];
  expect(headers).toContain("content-type");
  expect(headers).toContain("x-amz-acl");
});
