import type { StyleSpecification } from "maplibre-gl";

export default {
  version: 8,
  name: "OpenStreetMap",
  center: [0, 0],
  zoom: 1,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      attribution: "© OpenStreetMap contributors - Open Database License",
      tileSize: 256,
      minzoom: 0,
      maxzoom: 24,
    },
  },
  layers: [
    {
      id: "simple-tiles",
      type: "raster",
      source: "raster-tiles",
    },
  ],
} as const satisfies StyleSpecification;
