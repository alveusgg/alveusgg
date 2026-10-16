import { describe, expect, it } from "vitest";

import {
  controlCameraNames,
  presetCatalogCamera,
  resolveControlCamera,
} from "../src/data/tech/camera-identifiers";

describe("camera identities", () => {
  it("keeps every canonical control-api identity stable", () => {
    for (const camera of controlCameraNames)
      expect(resolveControlCamera(camera)).toBe(camera);
  });

  it.each([
    ["crow", "crowoutdoor"],
    ["crowin", "crowindoor"],
    ["marmoset", "marmosetoutdoor"],
    ["marmin", "marmosetindoor"],
    ["littles", "parrot"],
    ["macaw", "macaws"],
    ["tarantulaptz", "tarantulawall"],
    ["CHICKENCAM", "chickenoutdoor"],
  ])("resolves %s to %s", (name, canonical) => {
    expect(resolveControlCamera(name!)).toBe(canonical);
  });

  it("does not turn retired or fixed legacy views into camera commands", () => {
    for (const camera of [
      "hank",
      "chin2",
      "chin3",
      "unknown",
      "wolfmulti",
      "constructor",
      "__proto__",
      "toString",
    ])
      expect(resolveControlCamera(camera)).toBeUndefined();
    expect(presetCatalogCamera("chin2")).toBe("legacy:chin2");
  });
});
