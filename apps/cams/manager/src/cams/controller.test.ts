import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type PresetJob } from "../presets/runner.ts";

const { run, operation, pending, environment } = vi.hoisted(() => ({
  run: vi.fn(),
  operation: vi.fn(),
  pending: vi.fn(),
  environment: {
    SITE_URL: "https://site.test",
    SITE_SHARED_KEY: "mock",
    CONTROL_API_TOKEN: "mock",
    CONTROL_API: { fetch: vi.fn() },
  },
}));
vi.mock("cloudflare:workers", () => ({
  env: environment,
  DurableObject: class {
    constructor(public ctx: DurableObjectState) {}
  },
}));
vi.mock("../presets/client.ts", () => ({
  presetWebsite: () => ({
    presets: { operation: { query: operation }, pending: { query: pending } },
  }),
}));
vi.mock("../presets/runner.ts", () => ({ runPresetJob: run }));
import { CamControllerDurableObject } from "./controller.ts";

const NOW = 1700000000000;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
class Storage {
  values = new Map<string, PresetJob>();
  alarm: number | null = null;
  onList?: (count: number) => Promise<void>;
  private lists = 0;
  private serial = Promise.resolve();
  async get(key: string) {
    return structuredClone(this.values.get(key));
  }
  async put(key: string, value: PresetJob) {
    this.values.set(key, structuredClone(value));
  }
  async delete(key: string) {
    return this.values.delete(key);
  }
  async list() {
    const snapshot = new Map(
      Array.from(this.values.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [key, structuredClone(value)]),
    );
    await this.onList?.(++this.lists);
    return snapshot;
  }
  async setAlarm(time: number) {
    this.alarm = time;
  }
  async deleteAlarm() {
    this.alarm = null;
  }
  transaction<T>(callback: (storage: Storage) => Promise<T>): Promise<T> {
    const result = this.serial.then(() => callback(this));
    this.serial = result.then(
      () => {},
      () => {},
    );
    return result;
  }
}
function fixture() {
  const storage = new Storage();
  const tasks: Promise<unknown>[] = [];
  const state = {
    storage,
    waitUntil: (promise: Promise<unknown>) => {
      tasks.push(promise);
    },
  };
  const controller = new CamControllerDurableObject(
    state as unknown as DurableObjectState,
    environment as unknown as Env,
  );
  return { storage, controller, tasks };
}
function job(
  id: string,
  camera: string,
  createdAt = NOW,
  availableAt = NOW,
): PresetJob {
  return { id, camera, createdAt, availableAt, attempt: 0 };
}
function seed(storage: Storage, ...jobs: PresetJob[]) {
  for (const job of jobs)
    storage.values.set(`preset:${job.id}`, structuredClone(job));
}
async function spinUntil(check: () => boolean) {
  for (let count = 0; count < 100; count++) {
    if (check()) return;
    await Promise.resolve();
  }
  throw new Error("Local test did not reach expected state");
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(NOW);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  run.mockResolvedValue(undefined);
  pending.mockResolvedValue([]);
  operation.mockImplementation(async ({ id }: { id: string }) => ({
    id,
    createdAt: new Date(NOW).toISOString(),
    camera: "garden",
  }));
});
afterEach(() => vi.restoreAllMocks());

describe("durable preset delivery queue", () => {
  it("runs queued jobs chronologically rather than UUID lexicographic order", async () => {
    const f = fixture();
    seed(
      f.storage,
      job("z-older", "garden", NOW - 1),
      job("a-newer", "garden", NOW),
    );
    await f.controller.alarm();
    expect(run.mock.calls.map(([job]) => job.id)).toEqual([
      "z-older",
      "a-newer",
    ]);
    expect(f.storage.values.size).toBe(0);
    expect(f.storage.alarm).toBeNull();
  });

  it("blocks later work behind a camera's delayed head but continues another camera, scheduling only eligible heads", async () => {
    const f = fixture();
    seed(
      f.storage,
      job("old-delayed", "garden", NOW - 2, NOW + 10000),
      job("new-ready", "garden", NOW - 1),
      job("independent", "fox", NOW),
    );
    await f.controller.alarm();
    expect(run.mock.calls.map(([job]) => job.id)).toEqual(["independent"]);
    expect(f.storage.values.size).toBe(2);
    expect(f.storage.alarm).toBe(NOW + 10000);
  });

  it("retries a failed head without allowing later same-camera movement, while other cameras progress", async () => {
    const f = fixture();
    seed(
      f.storage,
      job("failed", "garden", NOW - 2),
      job("later", "garden", NOW - 1),
      job("independent", "fox", NOW),
    );
    run.mockImplementation(async (job: PresetJob) => {
      if (job.id === "failed") throw new Error("local failure");
    });
    await f.controller.alarm();
    expect(run.mock.calls.map(([job]) => job.id)).toEqual([
      "failed",
      "independent",
    ]);
    expect(f.storage.values.get("preset:failed")).toMatchObject({
      attempt: 1,
      availableAt: NOW + 2000,
    });
    expect(f.storage.alarm).toBe(NOW + 2000);
  });

  it("caps one drain at ten jobs and leaves an alarm for the rest", async () => {
    const f = fixture();
    seed(
      f.storage,
      ...Array.from({ length: 12 }, (_, index) =>
        job(`job-${index.toString().padStart(2, "0")}`, "garden", NOW + index),
      ),
    );
    await f.controller.alarm();
    expect(run).toHaveBeenCalledTimes(10);
    expect(f.storage.values.size).toBe(2);
    expect(f.storage.alarm).toBe(NOW + 1000);
    await f.controller.alarm();
    expect(run).toHaveBeenCalledTimes(12);
    expect(f.storage.values.size).toBe(0);
  });

  it("duplicate enqueue preserves durable movement/receipt state", async () => {
    const f = fixture();
    const existing = {
      ...job("existing", "garden", NOW - 1, NOW + 10000),
      attempt: 4,
      loadDispatched: true,
      receipt: { camera: "garden", sha256: "a".repeat(64) },
    };
    seed(f.storage, existing);
    await Promise.all([
      f.controller.enqueuePresetJob(existing.id),
      f.controller.enqueuePresetJob(existing.id),
    ]);
    await Promise.all(f.tasks);
    expect(f.storage.values.get("preset:existing")).toEqual(existing);
    expect(f.storage.values.size).toBe(1);
    expect(run).not.toHaveBeenCalled();
    expect(f.storage.alarm).not.toBeNull();
  });

  it("concurrent enqueue enforces capacity atomically", async () => {
    const f = fixture();
    seed(
      f.storage,
      ...Array.from({ length: 499 }, (_, index) =>
        job(`existing-${index}`, "waiting", NOW - 1, NOW + 10000),
      ),
    );
    const gate = deferred();
    run.mockImplementation(() => gate.promise);
    const results = await Promise.allSettled([
      f.controller.enqueuePresetJob("first"),
      f.controller.enqueuePresetJob("second"),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(f.storage.values.size).toBe(500);
    gate.resolve();
    await Promise.all(f.tasks);
  });

  it("cannot strand an enqueue racing with final empty-queue alarm removal", async () => {
    const f = fixture();
    const finalList = deferred();
    const allowFinal = deferred();
    const running = deferred();
    f.storage.onList = async (count) => {
      if (count === 2) {
        finalList.resolve();
        await allowFinal.promise;
      }
    };
    run.mockImplementation(() => running.promise);
    const drain = f.controller.alarm();
    await finalList.promise;
    const enqueue = f.controller.enqueuePresetJob("racing");
    allowFinal.resolve();
    await Promise.all([drain, enqueue]);
    // The job may already have started a fresh drain, or be awaiting its alarm.
    expect(f.storage.values.has("preset:racing")).toBe(true);
    expect(f.storage.alarm).not.toBeNull();
    running.resolve();
    await Promise.all(f.tasks);
  });

  it("paginates past a full oldest page of blocked operations to recover newer work", async () => {
    const f = fixture();
    const old = Array.from({ length: 100 }, (_, index) => ({
      id: `old-${index}`,
      camera: "garden",
      createdAt: new Date(NOW - 2000 + index).toISOString(),
    }));
    seed(
      f.storage,
      ...old.map((row) =>
        job(row.id, row.camera, Date.parse(row.createdAt), NOW + 10000),
      ),
    );
    const fresh = {
      id: "fresh",
      camera: "fox",
      createdAt: new Date(NOW).toISOString(),
    };
    pending.mockResolvedValueOnce(old).mockResolvedValueOnce([fresh]);
    operation.mockImplementation(async ({ id }: { id: string }) =>
      id === fresh.id ? fresh : old.find((row) => row.id === id),
    );
    await f.controller.reconcilePresetJobs();
    await Promise.all(f.tasks);
    await f.controller.alarm();
    expect(pending).toHaveBeenCalledTimes(2);
    expect(pending.mock.calls[1]?.[0]).toEqual({
      after: { id: old[99]!.id, createdAt: old[99]!.createdAt },
    });
    expect(run.mock.calls.map(([job]) => job.id)).toContain("fresh");
    expect(f.storage.values.size).toBe(100);
  });

  it("stops recovery gracefully if concurrent enqueues fill the queue after its capacity check", async () => {
    const f = fixture();
    pending.mockImplementationOnce(async () => {
      seed(
        f.storage,
        ...Array.from({ length: 500 }, (_, index) =>
          job(`full-${index}`, "garden", NOW - 1, NOW + 10000),
        ),
      );
      f.storage.alarm = NOW + 1000;
      return [
        {
          id: "overflow",
          createdAt: new Date(NOW).toISOString(),
          camera: "garden",
        },
      ];
    });
    await expect(f.controller.reconcilePresetJobs()).resolves.toBeUndefined();
    expect(f.storage.values.size).toBe(500);
    expect(f.storage.values.has("preset:overflow")).toBe(false);
    expect(f.storage.alarm).not.toBeNull();
  });

  it("reports a bounded delivery stage without logging credential-bearing error messages", async () => {
    const f = fixture();
    seed(f.storage, job("secret-safe", "garden"));
    run.mockImplementation(async (_job, deps) => {
      deps.onStage("image-upload");
      throw new TypeError(
        "fetch failed at https://upload.test/?X-Amz-Credential=secret-value",
      );
    });
    await f.controller.alarm();
    const logged = JSON.stringify(vi.mocked(console.warn).mock.calls);
    expect(logged).toContain("image-upload");
    expect(logged).not.toContain("secret-value");
    expect(logged).not.toContain("upload.test");
  });

  it("re-arms a watchdog alarm even while an earlier drain is still awaiting I/O", async () => {
    const f = fixture();
    seed(f.storage, job("slow", "garden"));
    const gate = deferred();
    run.mockImplementation(() => gate.promise);
    const first = f.controller.alarm();
    await spinUntil(() => run.mock.calls.length === 1);
    vi.mocked(Date.now).mockReturnValue(NOW + 30000);
    const second = f.controller.alarm();
    await spinUntil(() => f.storage.alarm === NOW + 60000);
    expect(run).toHaveBeenCalledTimes(1);
    gate.resolve();
    await Promise.all([first, second]);
    expect(f.storage.values.size).toBe(0);
    expect(f.storage.alarm).toBeNull();
  });
});
