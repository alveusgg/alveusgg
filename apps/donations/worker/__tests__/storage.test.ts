import { beforeEach, describe, expect, it, vi } from "vitest";
import { DurableObjectDonationStorage } from "../src/providers/storage";

const { removeDonations } = vi.hoisted(() => ({ removeDonations: vi.fn() }));
vi.mock("../src/utils/site-api", () => ({
  createSiteApi: () => ({
    donations: { removeDonations: { mutate: removeDonations } },
  }),
}));

function setup() {
  const metadata = new Map<string, string>();
  const rows = (values: Record<string, unknown>[]) => {
    const it = values[Symbol.iterator]();
    return { next: () => it.next() };
  };
  const exec = vi.fn((query: string, ...args: string[]) => {
    if (query.includes("SELECT metadata")) {
      const value = metadata.get(args[0]!);
      return rows(value ? [{ metadata: value }] : []);
    }
    if (query.includes("INTO providerMetadata"))
      metadata.set(args[0]!, args[1]!);
    if (query.includes("DELETE FROM providerMetadata"))
      metadata.delete(args[0]!);
    return rows([]);
  });
  const resync = vi.fn(async () => new Response(null, { status: 200 }));
  const ctx = { storage: { sql: { exec } } } as unknown as DurableObjectState;
  const env = {
    MURAL_ID: "two",
    SHARED_KEY: "shared-key",
    PIXELS_MANAGER: { getByName: () => ({ fetch: resync }) },
  } as unknown as Env;
  return { exec, resync, storage: new DurableObjectDonationStorage(ctx, env) };
}

describe("removing donations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("deletes the donations, releases their reservations and resyncs the mural", async () => {
    removeDonations.mockResolvedValue({ donations: 2, pixels: 3 });
    const { exec, resync, storage } = setup();

    await storage.remove("neon", ["example-1", "example-2"], "payment failed");
    expect(removeDonations).toHaveBeenCalledWith({
      donations: [
        { provider: "neon", providerUniqueId: "example-1" },
        { provider: "neon", providerUniqueId: "example-2" },
      ],
      reason: "payment failed",
    });
    for (const id of ["example-1", "example-2"]) {
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM donations"),
        "neon",
        id,
      );
    }
    expect(resync).toHaveBeenCalledWith(
      "https://pixels/resync",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "ApiKey shared-key" },
      }),
    );
  });

  it("resyncs the mural even when nothing was removed", async () => {
    removeDonations.mockResolvedValue({ donations: 0, pixels: 0 });
    const { resync, storage } = setup();

    await storage.remove("neon", [], "payment failed");
    expect(removeDonations).toHaveBeenCalledWith({
      donations: [],
      reason: "payment failed",
    });
    expect(resync).toHaveBeenCalledOnce();
  });

  it("fails when the mural resync fails, so the next sweep repeats it", async () => {
    removeDonations.mockResolvedValue({ donations: 1, pixels: 1 });
    const { resync, storage } = setup();
    resync.mockResolvedValueOnce(new Response(null, { status: 503 }));

    await expect(
      storage.remove("neon", ["example-1"], "payment failed"),
    ).rejects.toThrow("Failed to resync pixels");
  });
});
