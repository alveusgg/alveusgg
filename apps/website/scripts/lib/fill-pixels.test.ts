import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sha256, writePrivateJson } from "./backfill";
import { type PlannedPixel, makePixelPlan } from "./pixel-plan";

const db = vi.hoisted(() => ({
  donation: { findMany: vi.fn() },
  pixel: { findMany: vi.fn(), createMany: vi.fn() },
  $transaction: vi.fn(),
  $disconnect: vi.fn(),
}));
vi.mock("@alveusgg/database", () => ({ prisma: db }));

const donation = {
  id: "example",
  providerUniqueId: "example-org-1",
  provider: "neon",
  amount: 10000,
  receivedAt: new Date("2025-01-01T00:00:00Z"),
  donatedAt: null,
  note: null,
  donatedBy: { primary: "displayName", displayName: "Example" },
  tags: {},
  providerMetadata: { neonCampaignId: "example" },
};
const originalArgv = process.argv;
const originalExitCode = process.exitCode;
const originalDatabaseUrl = process.env.DATABASE_URL;
let dir: string;
let pixels: PlannedPixel[];
let log: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  dir = mkdtempSync(join(tmpdir(), "pixel-cli-test-"));
  pixels = [];
  process.env.DATABASE_URL = "mysql://user:unused@localhost/example";
  process.exitCode = 0;
  db.donation.findMany.mockImplementation(async () => [
    { ...donation, pixels: [...pixels] },
  ]);
  db.pixel.findMany.mockImplementation(async () => [...pixels]);
  db.pixel.createMany.mockImplementation(
    async ({ data }: { data: PlannedPixel[] }) => {
      pixels.push(...data);
      return { count: data.length };
    },
  );
  db.$transaction.mockImplementation(
    async (callback: (tx: typeof db) => Promise<unknown>) => callback(db),
  );
  log = vi.spyOn(console, "log").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("No network calls allowed");
    }),
  );
});

afterEach(() => {
  process.argv = originalArgv;
  process.exitCode = originalExitCode;
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  rmSync(dir, { recursive: true });
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function run(args: string[]) {
  process.argv = ["node", "fill-pixels.ts", ...args];
  await import("../fill-pixels");
  await vi.waitFor(() =>
    expect(log.mock.calls.length + error.mock.calls.length).toBeGreaterThan(0),
  );
}

async function reviewedPlan() {
  const plan = await makePixelPlan([{ ...donation, pixels: [] }], [], {
    target: "localhost/example",
    muralId: "two",
    columns: 200,
    rows: 50,
  });
  const path = join(dir, "plan.json");
  writePrivateJson(path, plan);
  return { path, hash: sha256(readFileSync(path)) };
}

describe("pixel CLI write guards", () => {
  it("plans by default without a transaction, inserts or network calls", async () => {
    const ids = join(dir, "ids.json");
    writePrivateJson(ids, [donation.providerUniqueId]);
    await run([
      `--provider-unique-ids=${ids}`,
      "--mural=two",
      `--plan-out=${join(dir, "plan.json")}`,
    ]);
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.pixel.createMany).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
  it.each(["wrong-hash", "wrong-target", "contradictory-mode"])(
    "rejects %s before starting a transaction",
    async (scenario) => {
      const { path, hash } = await reviewedPlan();
      await run([
        "--apply",
        `--plan=${path}`,
        `--confirm-sha=${scenario === "wrong-hash" ? "wrong" : hash}`,
        `--confirm-target=${scenario === "wrong-target" ? "other/database" : "localhost/example"}`,
        ...(scenario === "contradictory-mode" ? ["--dry-run"] : []),
      ]);
      expect(process.exitCode).toBe(1);
      expect(db.$transaction).not.toHaveBeenCalled();
      expect(db.pixel.createMany).not.toHaveBeenCalled();
    },
  );
  it("applies and verifies a reviewed plan quietly, then skips it on retry", async () => {
    const { path, hash } = await reviewedPlan();
    const args = [
      "--apply",
      `--plan=${path}`,
      `--confirm-sha=${hash}`,
      "--confirm-target=localhost/example",
    ];
    await run(args);
    await vi.waitFor(() => expect(db.$disconnect).toHaveBeenCalledOnce());
    expect(db.pixel.createMany).toHaveBeenCalledOnce();
    expect(db.pixel.createMany.mock.calls[0]?.[0]).not.toHaveProperty(
      "skipDuplicates",
    );
    expect(db.$transaction.mock.calls[0]?.[1]).toEqual({
      isolationLevel: "Serializable",
    });
    expect(pixels).toHaveLength(1);
    expect(fetch).not.toHaveBeenCalled();
    vi.resetModules();
    vi.clearAllMocks();
    await run(args);
    await vi.waitFor(() => expect(db.$disconnect).toHaveBeenCalledOnce());
    expect(db.pixel.createMany).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
