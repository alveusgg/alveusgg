import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Donation } from "@alveusgg/donations-core";
import { DurableObjectDonationStorage } from "../src/providers/storage";

const { removeDonations, createDonations } = vi.hoisted(() => ({
  removeDonations: vi.fn(),
  createDonations: vi.fn(),
}));
vi.mock("../src/utils/site-api", () => ({
  createSiteApi: () => ({
    donations: {
      removeDonations: { mutate: removeDonations },
      createDonations: { mutate: createDonations },
    },
  }),
}));

// Just enough of SqlStorage for the statements the storage runs.
function fakeSql() {
  const reservations = new Map<string, string>();
  const metadata = new Map<string, string>();
  const cancelled = new Map<string, string>();
  const rows = (values: Record<string, unknown>[]) => {
    const it = values[Symbol.iterator]();
    return { next: () => it.next() };
  };
  const exec = vi.fn((query: string, ...args: string[]) => {
    if (query.includes("INTO cancelledDonations")) {
      cancelled.set(args[1]!, args[2]!);
    } else if (query.includes("FROM cancelledDonations")) {
      const at = cancelled.get(args[1]!);
      return rows(at ? [{ cancelledAt: at }] : []);
    } else if (query.includes("DELETE FROM donations")) {
      reservations.delete(args[1]!);
    } else if (query.includes("SELECT metadata")) {
      const value = metadata.get(args[0]!);
      return rows(value ? [{ metadata: value }] : []);
    } else if (query.includes("INTO providerMetadata")) {
      metadata.set(args[0]!, args[1]!);
    } else if (query.includes("DELETE FROM providerMetadata")) {
      metadata.delete(args[0]!);
    }
    return rows([]);
  });
  return { exec, reservations, metadata, cancelled };
}

function setup() {
  const sql = fakeSql();
  const resync = vi.fn(async () => new Response(null, { status: 200 }));
  const process = vi.fn(async () => {});
  const ctx = { storage: { sql } } as unknown as DurableObjectState;
  const env = {
    MURAL_ID: "two",
    SHARED_KEY: "shared-key",
    PIXELS_MANAGER: { getByName: () => ({ fetch: resync, process }) },
  } as unknown as Env;
  return {
    sql,
    resync,
    process,
    storage: new DurableObjectDonationStorage(ctx, env),
  };
}

const donation = (receivedAt: string) =>
  ({
    id: crypto.randomUUID(),
    provider: "neon",
    providerUniqueId: "example-1",
    receivedAt: new Date(receivedAt),
  }) as Donation;

describe("removing donations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("deletes the donation, releases its reservation and resyncs the mural", async () => {
    removeDonations.mockResolvedValue({ donations: 1, pixels: 2 });
    const { sql, resync, storage } = setup();

    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).resolves.toEqual({ donations: 1, pixels: 2 });
    expect(removeDonations).toHaveBeenCalledWith({
      donations: [{ provider: "neon", providerUniqueId: "example-1" }],
      reason: "payment failed",
    });
    expect(sql.exec).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM donations"),
      "neon",
      "example-1",
    );
    expect(resync).toHaveBeenCalledWith(
      "https://pixels/resync",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "ApiKey shared-key" },
      }),
    );
  });

  it("skips the mural resync when no pixels were removed", async () => {
    removeDonations.mockResolvedValue({ donations: 0, pixels: 0 });
    const { resync, storage } = setup();

    await storage.remove("neon", "example-1", "deleted in Neon");
    expect(resync).not.toHaveBeenCalled();
  });

  it("keeps the reservation when the site rejects the removal", async () => {
    removeDonations.mockRejectedValue(new Error("site unavailable"));
    const { sql, storage } = setup();

    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).rejects.toThrow("site unavailable");
    expect(sql.exec).not.toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM donations"),
      expect.anything(),
      expect.anything(),
    );
  });

  it("retries a failed mural resync even when the retried removal finds no pixels", async () => {
    removeDonations.mockResolvedValueOnce({ donations: 1, pixels: 2 });
    const { resync, storage } = setup();
    resync.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).rejects.toThrow("Failed to resync pixels");

    // The donation is gone now, so a retry deletes nothing but still resyncs.
    removeDonations.mockResolvedValueOnce({ donations: 0, pixels: 0 });
    await storage.remove("neon", "example-1", "payment failed");
    expect(resync).toHaveBeenCalledTimes(2);

    await storage.resyncPixelsIfPending();
    expect(resync).toHaveBeenCalledTimes(2);
  });

  it("keeps a newer pending resync when an older retry overlaps a removal", async () => {
    const { resync, storage } = setup();
    // Leave a resync pending from an earlier failure.
    removeDonations.mockResolvedValueOnce({ donations: 1, pixels: 1 });
    resync.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).rejects.toThrow();

    const pending: ((response: Response) => void)[] = [];
    resync.mockImplementation(
      () => new Promise<Response>((done) => pending.push(done)),
    );
    // The hourly retry starts...
    const retry = storage.resyncPixelsIfPending();
    await vi.advanceTimersByTimeAsync(0);
    // ...and a newer removal deletes more pixels meanwhile.
    removeDonations.mockResolvedValueOnce({ donations: 1, pixels: 2 });
    const removal = storage.remove("neon", "example-2", "payment failed");
    const removalSettled = removal.catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(0);

    // Settle whichever resyncs are in flight: the older one succeeds, the
    // newer one fails. Run until both callers have finished.
    for (let step = 0; step < 4; step++) {
      const next = pending.shift();
      next?.(new Response(null, { status: step === 0 ? 200 : 500 }));
      await vi.advanceTimersByTimeAsync(0);
    }
    await retry;
    expect(await removalSettled).toBeInstanceOf(Error);

    // The newer resync is still pending and retried.
    resync.mockResolvedValue(new Response(null, { status: 200 }));
    const before = resync.mock.calls.length;
    await storage.resyncPixelsIfPending();
    expect(resync.mock.calls.length).toBe(before + 1);
  });

  it("retries a pending mural resync on its own", async () => {
    removeDonations.mockResolvedValue({ donations: 1, pixels: 1 });
    const { resync, storage } = setup();
    resync.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).rejects.toThrow();

    await storage.resyncPixelsIfPending();
    expect(resync).toHaveBeenCalledTimes(2);
  });
});

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("delivering queued donations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    removeDonations.mockResolvedValue({ donations: 1, pixels: 0 });
    createDonations.mockResolvedValue(undefined);
  });

  it("drops a donation that was cancelled before delivery, but not a later re-import", async () => {
    const { storage } = setup();
    const queued = donation("2026-01-01T23:59:00Z");
    await storage.remove("neon", "example-1", "payment failed");

    const reimported = donation("2026-01-02T01:00:00Z");
    const other = {
      ...donation("2026-01-01T23:00:00Z"),
      providerUniqueId: "example-2",
    };
    await expect(
      storage.deliverDonations([queued, reimported, other]),
    ).resolves.toEqual([reimported, other]);
    expect(createDonations).toHaveBeenCalledWith({
      donations: [reimported, other],
    });
  });

  it("finishes an in-flight delivery before removing, so the removal deletes it", async () => {
    const { storage } = setup();
    const write = deferred();
    const order: string[] = [];
    createDonations.mockImplementation(async () => {
      await write.promise;
      order.push("create");
    });
    removeDonations.mockImplementation(async () => {
      order.push("remove");
      return { donations: 1, pixels: 0 };
    });

    const delivery = storage.deliverDonations([
      donation("2026-01-01T23:59:00Z"),
    ]);
    const removal = storage.remove("neon", "example-1", "payment failed");
    await vi.advanceTimersByTimeAsync(0);
    expect(removeDonations).not.toHaveBeenCalled();

    write.resolve();
    await delivery;
    await removal;
    expect(order).toEqual(["create", "remove"]);
  });

  it("finishes in-flight pixel allocation before removing, then resyncs the mural", async () => {
    const { storage, process, resync } = setup();
    const allocation = deferred();
    process.mockImplementation(() => allocation.promise);
    removeDonations.mockResolvedValue({ donations: 1, pixels: 1 });

    const delivery = storage.deliverPixels([donation("2026-01-01T23:59:00Z")]);
    const removal = storage.remove("neon", "example-1", "payment failed");
    await vi.advanceTimersByTimeAsync(0);
    expect(removeDonations).not.toHaveBeenCalled();

    allocation.resolve();
    await delivery;
    await removal;
    expect(removeDonations).toHaveBeenCalledOnce();
    expect(resync).toHaveBeenCalledOnce();
  });

  it("skips pixel allocation for a donation cancelled while queued", async () => {
    const { storage, process } = setup();
    await storage.remove("neon", "example-1", "payment failed");

    await expect(
      storage.deliverPixels([donation("2026-01-01T23:59:00Z")]),
    ).resolves.toEqual([]);
    expect(process).not.toHaveBeenCalled();
  });

  it("keeps working after a failed delivery", async () => {
    const { storage } = setup();
    createDonations.mockRejectedValueOnce(new Error("site unavailable"));

    await expect(
      storage.deliverDonations([donation("2026-01-01T23:59:00Z")]),
    ).rejects.toThrow("site unavailable");
    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).resolves.toEqual({ donations: 1, pixels: 0 });
  });
});
