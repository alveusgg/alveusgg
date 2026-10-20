import { describe, expect, it } from "vitest";

import cameras from "@/data/tech/cameras";
import { isCameraMulti, isCameraPTZ } from "@/data/tech/cameras.types";
import { catalogPresetEntries } from "@/data/tech/preset-catalog";

import type { RouterOutputs } from "@/utils/trpc";

type Row = RouterOutputs["presets"]["catalog"][number];
const row: Row = {
  id: "test",
  camera: "garden",
  name: "home",
  description: "Home",
  position: { pan: 10, tilt: 20, zoom: 1 },
  version: 1,
  provenance: "capture",
  updatedAt: "2026-10-16T00:00:00.000Z",
  image: null,
  imageProvenance: null,
  capturedAt: null,
};

describe("database preset presentation", () => {
  it.each(["legacy", "unknown"])(
    "never exposes load for %s provenance",
    (provenance) => {
      expect(
        catalogPresetEntries([{ ...row, provenance }])[0]?.[1].canLoad,
      ).toBe(false);
    },
  );
  it.each(["capture", "control-api-import"])(
    "allows known cameras with %s provenance without requiring a photo",
    (provenance) => {
      const preset = catalogPresetEntries([{ ...row, provenance }])[0]?.[1];
      expect(preset?.canLoad).toBe(true);
      expect(preset?.image).toBeNull();
    },
  );
  it("keeps unknown archived camera views read-only", () => {
    expect(
      catalogPresetEntries([{ ...row, camera: "legacy:chin2" }])[0]?.[1]
        .canLoad,
    ).toBe(false);
  });
  it("keeps the legacy-image label when source data has a historical photo", () => {
    const image = {
      src: "https://example.com/legacy.png",
      width: 300,
      height: 169,
    };
    expect(
      catalogPresetEntries([
        {
          ...row,
          provenance: "control-api-import",
          image,
          imageProvenance: "legacy",
        },
      ])[0]?.[1],
    ).toMatchObject({ canLoad: true, image, imageProvenance: "legacy" });
  });
  it("uses a placeholder for invalid image dimensions", () => {
    expect(
      catalogPresetEntries([
        {
          ...row,
          image: { src: "https://example.com/image.png", width: 0, height: 0 },
        },
      ])[0]?.[1].image,
    ).toBeNull();
  });
  it("preserves the complete camera presentation and ordered multi-view members", () => {
    expect(Object.values(cameras).filter(isCameraPTZ)).toHaveLength(44);
    expect(Object.values(cameras).filter(isCameraMulti)).toHaveLength(12);
    expect(Object.keys(cameras).slice(0, 4)).toEqual([
      "bb",
      "chicken",
      "chickenindoor",
      "chickenmulti",
    ]);
    expect(cameras.crowincrowout.multi.cameras).toEqual(["crowin", "crowout"]);
    expect(cameras.crowoutcrowin.multi.cameras).toEqual(["crowout", "crowin"]);
    expect(cameras.chickenmulti.title).toBe("Chicken Multi-View");
  });
});
