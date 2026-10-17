import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { readLegacyManifest } from "../build-scripts/migrate-presets";
import {
  DATA_ROOT,
  DEFAULT_BASE,
  controlImportPatch,
  extractLegacySources,
  mappingConflicts,
  planControlExport,
} from "../build-scripts/migrate-presets-data";

const position = { pan: 10, tilt: -20, zoom: 3000 };
const source = (camera: string, name = "home") => ({
  path: `${DATA_ROOT}${camera}.ts`,
  text: `import image from "@/assets/presets/${camera}/home.png";
const entries = { "${name}": {
  description: "Curated \\"description\\"", image,
  position: { pan: 10, tilt: -20, zoom: 3000 },
  // modified: 2025-10-09T11:10:30.308Z
} };
const ${camera} = { title: "Camera title", group: "group", presets: entries };
export default ${camera};`,
});

it("extracts records without evaluating source code and retains curated strings, numbers and timestamps", () => {
  const { presets } = extractLegacySources([
    source("garden", "home-with-dash"),
  ]);
  expect(presets).toHaveLength(1);
  expect(presets[0]).toMatchObject({
    name: "home-with-dash",
    camera: "garden",
    description: 'Curated "description"',
    position,
    modifiedAt: "2025-10-09T11:10:30.308Z",
    title: "Camera title",
    group: "group",
  });
  expect(() =>
    extractLegacySources([
      {
        ...source("garden"),
        text: source("garden").text.replace("pan: 10", "pan: executeCode()"),
      },
    ]),
  ).toThrow("finite");
});

it("preserves multi-view members in their original order", () => {
  const parsed = extractLegacySources([
    {
      path: `${DATA_ROOT}wolfmulti.ts`,
      text: `
import image from "@/assets/presets/wolfmulti.png";
const wolfmulti = { title: "Multi", group: "wolf", multi: {
 description: "Picture in picture", image, cameras: ["wolfcorner", "wolf"],
 // modified: 2025-10-09T11:10:30.500Z
} }; export default wolfmulti;`,
    },
  ]);
  expect(parsed.presets).toHaveLength(0);
  expect(parsed.multis[0]).toMatchObject({
    cameras: ["wolfcorner", "wolf"],
    description: "Picture in picture",
    modifiedAt: "2025-10-09T11:10:30.500Z",
  });
});

it("reports ambiguous canonical aliases and leaves distinct unknown views separate", () => {
  const { presets } = extractLegacySources([
    source("crow"),
    source("crowoutdoor"),
    source("chin2"),
    source("chin3"),
  ]);
  const conflicts = mappingConflicts(presets);
  expect(conflicts.cameras).toEqual([
    { camera: "crowoutdoor", sources: ["crow", "crowoutdoor"] },
  ]);
  expect(conflicts.names).toEqual([{ name: "crowoutdoor/home", count: 2 }]);
});

describe("bootstrap reconciliation", () => {
  const legacy = {
    provenance: "legacy",
    position,
    imageProvenance: "legacy",
    fileStorageObjectId: "legacy-photo",
  };
  it("retains an explicitly legacy photo only for exactly matching PTZ", () => {
    expect(
      controlImportPatch(legacy, { ...position, focus: 5000 }),
    ).toMatchObject({
      fileStorageObjectId: "legacy-photo",
      imageProvenance: "legacy",
      capturedAt: null,
    });
    expect(
      controlImportPatch(legacy, { ...position, pan: 10.0001 }),
    ).toMatchObject({ fileStorageObjectId: null, imageProvenance: null });
    expect(
      controlImportPatch({ ...legacy, imageProvenance: "capture" }, position),
    ).toMatchObject({ fileStorageObjectId: null });
  });
  it("is idempotent and preserves captures and earlier authoritative edits", () => {
    const first = controlImportPatch(legacy, position)!;
    expect(
      controlImportPatch({ ...legacy, ...first }, { ...position, pan: 11 }),
    ).toBeNull();
    expect(
      controlImportPatch({ ...legacy, provenance: "capture" }, position),
    ).toBeNull();
    expect(controlImportPatch(null, position)).toMatchObject({
      provenance: "control-api-import",
      fileStorageObjectId: null,
    });
  });
  it("retains unknown source records in the report and refuses ambiguous source aliases", () => {
    const unknown = {
      camera: "unrecognized-view",
      presets: [{ name: "example", position }],
    };
    const result = planControlExport({
      version: 1,
      cameras: [
        { camera: "crow", presets: [{ name: "home", position }] },
        unknown,
      ],
    });
    expect(result.known[0]?.camera).toBe("crowoutdoor");
    expect(result.unknown).toEqual([unknown]);
    expect(() =>
      planControlExport({
        version: 1,
        cameras: [
          { camera: "crow", presets: [] },
          { camera: "crowoutdoor", presets: [] },
        ],
      }),
    ).toThrow("Conflicting");
  });
});

// Shallow CI checkouts may not contain this historical object. Unit tests above
// remain independent; a full local checkout exercises actual archival coverage.
let hasBase = true;
try {
  execFileSync("git", ["cat-file", "-e", `${DEFAULT_BASE}^{commit}`], {
    stdio: "ignore",
  });
} catch {
  hasBase = false;
}
it.skipIf(!hasBase)(
  "reads all historical PNGs and records from git after working-tree deletion",
  async () => {
    const manifest = await readLegacyManifest();
    expect(manifest.sourceFiles).toBe(56);
    expect(manifest.presets).toHaveLength(760);
    expect(manifest.multis).toHaveLength(12);
    expect(manifest.assets).toHaveLength(780);
    expect(
      manifest.assets.filter((asset) => asset.kind === "orphan"),
    ).toHaveLength(8);
    expect(
      manifest.assets.every(
        (asset) =>
          asset.width > 0 && asset.height > 0 && asset.sha256.length === 64,
      ),
    ).toBe(true);
    expect(manifest.coverageHash).toBe(
      "11732aca4dee7bfea8d6c5d9efee2cb2edd22ccfdd230b395290bad657d8017d",
    );
  },
  30_000,
);
