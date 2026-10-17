import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DonationManifest,
  DonationRecord,
  databaseTarget,
  importDryRun,
  reconcileDonations,
  writePrivateJson,
} from "./backfill";
import {
  type PixelDonation,
  checkPixelPlan,
  makePixelPlan,
} from "./pixel-plan";

const date = new Date("2025-01-01T00:00:00.000Z");
const record = {
  id: "example-donation",
  provider: "neon",
  providerUniqueId: "example-org-1",
  amount: 10000,
  donatedAt: null,
  receivedAt: date.toISOString(),
  note: null,
  donatedBy: {
    primary: "displayName",
    displayName: "Example",
    email: "DONOR@example.invalid",
  },
  tags: {},
  providerMetadata: { neonCampaignId: "example" },
};
const donation = (): DonationRecord => DonationRecord.parse(record);
const pixelDonation = (): PixelDonation => ({ ...donation(), pixels: [] });
const config = {
  target: "localhost/example",
  muralId: "two",
  columns: 2,
  rows: 2,
};

describe("donation reconciliation", () => {
  it("keeps unknown source dates null and rejects duplicate IDs, invalid amounts and metadata", () => {
    expect(donation().donatedAt).toBeNull();
    expect(
      DonationManifest.safeParse({ version: 1, donations: [record, record] })
        .success,
    ).toBe(false);
    expect(DonationRecord.safeParse({ ...record, amount: 100.5 }).success).toBe(
      false,
    );
    expect(
      DonationRecord.safeParse({ ...record, provider: "twitch" }).success,
    ).toBe(false);
  });
  it("distinguishes missing, matching live deliveries, content conflicts and database ID collisions", () => {
    const d = donation();
    expect(reconcileDonations([d], []).missing).toEqual([d]);
    expect(
      reconcileDonations([d], [{ ...d, id: "live-id", receivedAt: new Date() }])
        .matching,
    ).toEqual([d.providerUniqueId]);
    expect(
      reconcileDonations([d], [{ ...d, amount: 20000 }]).conflicts[0]?.fields,
    ).toEqual(["amount"]);
    expect(
      reconcileDonations(
        [d],
        [{ ...d, providerUniqueId: "another-provider-id" }],
      ).conflicts[0]?.fields,
    ).toEqual(["id"]);
  });
  it("does not mutate by default and rejects contradictory import modes", () => {
    expect(importDryRun([])).toBe(true);
    expect(importDryRun(["--dry-run"])).toBe(true);
    expect(importDryRun(["--apply"])).toBe(false);
    expect(() => importDryRun(["--apply", "--dry-run"])).toThrow();
  });
  it("omits credentials and connection options from the target", () => {
    expect(
      databaseTarget("mysql://user:secret@localhost:3306/example?ssl=true"),
    ).toBe("localhost:3306/example");
  });
  it("creates private review artifacts, refuses replacement and does not follow symlinks", () => {
    const dir = mkdtempSync(join(tmpdir(), "backfill-test-"));
    try {
      const path = join(dir, "report.json");
      writePrivateJson(path, { example: true });
      expect(statSync(path).mode & 0o777).toBe(0o600);
      expect(() => writePrivateJson(path, {})).toThrow();
      symlinkSync(path, join(dir, "link.json"));
      expect(() => writePrivateJson(join(dir, "link.json"), {})).toThrow();
      expect(JSON.parse(readFileSync(path, "utf8"))).toEqual({ example: true });
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});

describe("reviewed silent pixel allocation", () => {
  it("plans free coordinates, hashes emails and skips the exact allocation on retry", async () => {
    const d = pixelDonation();
    const plan = await makePixelPlan([d], [{ column: 0, row: 0 }], config);
    const pixels = plan.donations[0]!.pixels;
    expect(pixels).toHaveLength(1);
    expect(pixels[0]).toMatchObject({
      identifier: "Example",
      receivedAt: date,
    });
    expect(pixels[0]?.email).toMatch(/^[a-f0-9]{64}$/);
    expect([pixels[0]?.column, pixels[0]?.row]).not.toEqual([0, 0]);
    expect(await checkPixelPlan(plan, [d], [])).toHaveLength(1);
    expect(await checkPixelPlan(plan, [{ ...d, pixels }], pixels)).toEqual([]);
    expect(await makePixelPlan([d], [{ column: 0, row: 0 }], config)).toEqual(
      plan,
    );
  });
  it("rejects occupied coordinates, changed donations and edited reviewed pixels", async () => {
    const d = pixelDonation();
    const plan = await makePixelPlan([d], [], config);
    const p = plan.donations[0]!.pixels[0]!;
    await expect(
      checkPixelPlan(plan, [d], [{ ...p, id: "someone-else" }]),
    ).rejects.toThrow("occupied");
    await expect(
      checkPixelPlan(plan, [{ ...d, amount: 20000 }], []),
    ).rejects.toThrow("content changed");
    await expect(
      checkPixelPlan(plan, [d], [{ ...p, identifier: "changed" }]),
    ).rejects.toThrow("pixel changed");
  });
  it("detects manual allocation after planning and counts existing pixels in the selected mural", async () => {
    const d = pixelDonation();
    const plan = await makePixelPlan([d], [], config);
    const p = plan.donations[0]!.pixels[0]!;
    await expect(
      checkPixelPlan(plan, [{ ...d, pixels: [{ ...p, id: "manual" }] }], []),
    ).rejects.toThrow("Existing pixels changed");
    expect(
      (await makePixelPlan([{ ...d, pixels: [p] }], [p], config)).donations[0]
        ?.pixels,
    ).toEqual([]);
    expect(
      (
        await makePixelPlan(
          [{ ...d, pixels: [{ ...p, muralId: "one" }] }],
          [],
          config,
        )
      ).donations[0]?.pixels,
    ).toHaveLength(1);
  });
  it("handles the exact tolerance boundary and fails when the mural is full", async () => {
    const d = pixelDonation();
    expect(
      (await makePixelPlan([{ ...d, amount: 9499 }], [], config)).donations[0]
        ?.pixels,
    ).toEqual([]);
    expect(
      (await makePixelPlan([{ ...d, amount: 9500 }], [], config)).donations[0]
        ?.pixels,
    ).toHaveLength(1);
    await expect(
      makePixelPlan([d], [{ column: 0, row: 0 }], {
        ...config,
        columns: 1,
        rows: 1,
      }),
    ).rejects.toThrow("insufficient");
  });
  it("rejects duplicate plan entries, over-allocation and out-of-bounds coordinates", async () => {
    const d = pixelDonation();
    const plan = await makePixelPlan([d], [], config);
    const entry = plan.donations[0]!;
    await expect(
      checkPixelPlan({ ...plan, donations: [entry, entry] }, [d, d], []),
    ).rejects.toThrow("Duplicate donation");
    await expect(
      checkPixelPlan(
        {
          ...plan,
          donations: [{ ...entry, pixels: [...entry.pixels, ...entry.pixels] }],
        },
        [d],
        [],
      ),
    ).rejects.toThrow("entitlement");
    const bad = { ...entry.pixels[0]!, column: 2 };
    await expect(
      checkPixelPlan(
        { ...plan, donations: [{ ...entry, pixels: [bad] }] },
        [d],
        [],
      ),
    ).rejects.toThrow("Invalid");
  });
});

describe("read-only Twitch source archive", () => {
  it("archives all pages with source IDs and no invented donation date", async () => {
    const { archiveTwitchCampaign } = await import("./twitch-archive");
    const calls: string[] = [];
    const result = await archiveTwitchCampaign("example", async (path) => {
      calls.push(path);
      if (path.startsWith("charity/campaigns"))
        return { data: [{ id: "campaign" }] };
      const second = path.includes("after=");
      return {
        data: [
          {
            id: second ? "two" : "one",
            campaign_id: "campaign",
            user_id: "example",
            user_login: "example",
            user_name: "Example",
            amount: { value: 10000, decimal_places: 2, currency: "USD" },
          },
        ],
        pagination: second ? {} : { cursor: "next" },
      };
    });
    expect(result.donationCount).toBe(2);
    expect(result.amountCents).toBe(20000);
    expect(result.pages).toHaveLength(2);
    expect(calls).toHaveLength(4);
    expect(result.donations[0]).not.toHaveProperty("donatedAt");
  });
  it("rejects incomplete pagination, duplicate source IDs and campaign switches", async () => {
    const { archiveTwitchCampaign } = await import("./twitch-archive");
    await expect(
      archiveTwitchCampaign("example", async (path) =>
        path.startsWith("charity/campaigns")
          ? { data: [{ id: "campaign" }] }
          : { data: [], pagination: { cursor: "same" } },
      ),
    ).rejects.toThrow("Pagination");
    let campaignReads = 0;
    await expect(
      archiveTwitchCampaign("example", async (path) =>
        path.startsWith("charity/campaigns")
          ? { data: [{ id: ++campaignReads === 1 ? "before" : "after" }] }
          : { data: [], pagination: {} },
      ),
    ).rejects.toThrow("campaign changed");
    const row = {
      id: "duplicate",
      campaign_id: "campaign",
      user_id: "example",
      user_login: "example",
      user_name: "Example",
      amount: { value: 10000, decimal_places: 2, currency: "USD" },
    };
    await expect(
      archiveTwitchCampaign("example", async (path) =>
        path.startsWith("charity/campaigns")
          ? { data: [{ id: "campaign" }] }
          : { data: [row, row], pagination: {} },
      ),
    ).rejects.toThrow("duplicate");
  });
});
