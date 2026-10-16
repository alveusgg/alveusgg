import type { RouterOutputs } from "@/utils/trpc";

import { resolveControlCamera } from "./camera-identifiers";
import type { PresetEntry } from "./cameras.types";

type CatalogPreset = RouterOutputs["presets"]["catalog"][number];

export function catalogPresetEntries(
  rows: readonly CatalogPreset[],
): PresetEntry[] {
  return rows.map((row) => [
    row.name,
    {
      description: row.description,
      image:
        row.image &&
        row.image.src &&
        row.image.width > 0 &&
        row.image.height > 0
          ? row.image
          : null,
      position: row.position,
      canLoad:
        (row.provenance === "capture" ||
          row.provenance === "control-api-import") &&
        resolveControlCamera(row.camera) !== undefined,
      imageProvenance:
        row.imageProvenance === "legacy" || row.imageProvenance === "capture"
          ? row.imageProvenance
          : null,
    },
  ]);
}
