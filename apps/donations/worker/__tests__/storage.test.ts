import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Donation } from "@alveusgg/donations-core";
import { DurableObjectDonationStorage } from "../src/providers/storage";

const { removeDonations } = vi.hoisted(() => ({ removeDonations: vi.fn() }));
vi.mock("../src/utils/site-api", () => ({
  createSiteApi: () => ({
    donations: { removeDonations: { mutate: removeDonations } },
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
  const ctx = { storage: { sql } } as unknown as DurableObjectState;
  const env = {
    MURAL_ID: "two",
    SHARED_KEY: "shared-key",
    PIXELS_MANAGER: { getByName: () => ({ fetch: resync }) },
  } as unknown as Env;
  return { sql, resync, storage: new DurableObjectDonationStorage(ctx, env) };
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

describe("cancelled donations in the queue", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  it("drops a donation queued before it was cancelled, but not a later re-import", async () => {
    removeDonations.mockResolvedValue({ donations: 0, pixels: 0 });
    const { storage } = setup();
    const queued = donation("2026-01-01T23:59:00Z");

    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"));
    // The website has not received the queued donation yet.
    await storage.remove("neon", "example-1", "payment failed");

    const reimported = donation("2026-01-02T01:00:00Z");
    const other = {
      ...donation("2026-01-01T23:00:00Z"),
      providerUniqueId: "example-2",
    };
    expect(storage.filterCancelled([queued, reimported, other])).toEqual([
      reimported,
      other,
    ]);
  });
});
