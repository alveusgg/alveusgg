import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const depsDir = path.join(process.cwd(), "public", "_deps");

const maplibreDist = path.join(
  path.dirname(require.resolve("maplibre-gl/package.json")),
  "dist",
);
const maplibreDest = path.join(depsDir, "maplibre-gl");

mkdirSync(maplibreDest, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(path.join(maplibreDist, file), path.join(maplibreDest, file));
}

const pdfjsDist = path.dirname(
  createRequire(require.resolve("react-pdf")).resolve(
    "pdfjs-dist/package.json",
  ),
);
const pdfjsDest = path.join(depsDir, "pdfjs");

mkdirSync(pdfjsDest, { recursive: true });
copyFileSync(
  path.join(pdfjsDist, "build", "pdf.worker.min.mjs"),
  path.join(pdfjsDest, "pdf.worker.min.mjs"),
);
for (const directory of ["cmaps", "standard_fonts", "wasm"]) {
  cpSync(path.join(pdfjsDist, directory), path.join(pdfjsDest, directory), {
    recursive: true,
  });
}
