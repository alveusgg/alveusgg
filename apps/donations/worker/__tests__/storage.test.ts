import { beforeEach, describe, expect, it, vi } from "vitest";
import { DurableObjectDonationStorage } from "../src/providers/storage";

const { removeDonations } = vi.hoisted(() => ({ removeDonations: vi.fn() }));
vi.mock("../src/utils/site-api", () => ({
  createSiteApi: () => ({
    donations: { removeDonations: { mutate: removeDonations } },
  }),
}));

function setup() {
  const exec = vi.fn();
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
  });

  it("deletes the donation, releases its reservation and resyncs the mural", async () => {
    removeDonations.mockResolvedValue({ donations: 1, pixels: 2 });
    const { exec, resync, storage } = setup();

    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).resolves.toEqual({ donations: 1, pixels: 2 });
    expect(removeDonations).toHaveBeenCalledWith({
      donations: [{ provider: "neon", providerUniqueId: "example-1" }],
      reason: "payment failed",
    });
    expect(exec).toHaveBeenCalledWith(
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
    const { exec, storage } = setup();

    await expect(
      storage.remove("neon", "example-1", "payment failed"),
    ).rejects.toThrow("site unavailable");
    expect(exec).not.toHaveBeenCalled();
  });
});
