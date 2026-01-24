import backcorner from "@/assets/presets/crowout/backcorner.png";
import bench from "@/assets/presets/crowout/bench.png";
import cache from "@/assets/presets/crowout/cache.png";
import corner from "@/assets/presets/crowout/corner.png";
import cornerc from "@/assets/presets/crowout/cornerc.png";
import down from "@/assets/presets/crowout/down.png";
import entry from "@/assets/presets/crowout/entry.png";
import escape from "@/assets/presets/crowout/escape.png";
import ground from "@/assets/presets/crowout/ground.png";
import groundl from "@/assets/presets/crowout/groundl.png";
import groundr from "@/assets/presets/crowout/groundr.png";
import home from "@/assets/presets/crowout/home.png";
import inside from "@/assets/presets/crowout/inside.png";
import insideperch from "@/assets/presets/crowout/insideperch.png";
import insidewater from "@/assets/presets/crowout/insidewater.png";
import left from "@/assets/presets/crowout/left.png";
import platform from "@/assets/presets/crowout/platform.png";
import platforminside from "@/assets/presets/crowout/platforminside.png";
import right from "@/assets/presets/crowout/right.png";
import stick from "@/assets/presets/crowout/stick.png";
import stickl from "@/assets/presets/crowout/stickl.png";
import stickz from "@/assets/presets/crowout/stickz.png";
import table from "@/assets/presets/crowout/table.png";
import training from "@/assets/presets/crowout/training.png";
import tree from "@/assets/presets/crowout/tree.png";
import treeb from "@/assets/presets/crowout/treeb.png";
import treebase from "@/assets/presets/crowout/treebase.png";
import treet from "@/assets/presets/crowout/treet.png";
import water from "@/assets/presets/crowout/water.png";

import type { Preset } from "../tech/cameras.types";

const crowoutPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -150.31, tilt: -14.39, zoom: 1 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  backcorner: {
    description: "back corner perch",
    image: backcorner,
    position: { pan: -150.2, tilt: -1.51, zoom: 3496 },
    // modified: 2025-10-09T11:10:29.836Z
  },
  bench: {
    description: "corner perches",
    image: bench,
    position: { pan: -106.05, tilt: -10.86, zoom: 1000 },
    // modified: 2025-10-09T11:10:29.836Z
  },
  cache: {
    description: "cache",
    image: cache,
    position: { pan: -153.81, tilt: -25.89, zoom: 1299 },
    // modified: 2025-10-09T11:10:29.836Z
  },
  corner: {
    description: "corner perch",
    image: corner,
    position: { pan: -105.85, tilt: -4.86, zoom: 2500 },
    // modified: 2025-10-09T11:10:29.836Z
  },
  cornerc: {
    description: "corner perch zoomed in",
    image: cornerc,
    position: { pan: -100.22, tilt: -4.26, zoom: 4498 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  down: {
    description: "straight down",
    image: down,
    position: { pan: 153.19, tilt: -73.78, zoom: 1 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  entry: {
    description: "crow indoor entry area",
    image: entry,
    position: { pan: 126.19, tilt: -48.78, zoom: 1 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  escape: {
    description: "escape hatch",
    image: escape,
    position: { pan: -131.64, tilt: -24.04, zoom: 3499 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  ground: {
    description: "view of the ground",
    image: ground,
    position: { pan: -153.81, tilt: -31.4, zoom: 1 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  groundl: {
    description: "ground left corner",
    image: groundl,
    position: { pan: 174.18, tilt: -36.78, zoom: 1 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  groundr: {
    description: "ground right corner",
    image: groundr,
    position: { pan: -129.31, tilt: -34.4, zoom: 1 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  inside: {
    description: "indoor area",
    image: inside,
    position: { pan: 143.19, tilt: -28.78, zoom: 1 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  insideperch: {
    description: "view of indoor perch",
    image: insideperch,
    position: { pan: 148.54, tilt: -7.25, zoom: 799 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  insidewater: {
    description: "indoor water bowl",
    image: insidewater,
    position: { pan: 164.52, tilt: -46.29, zoom: 1644 },
    // modified: 2025-10-09T11:10:29.840Z
  },
  left: {
    description: "left of outdoor crow enclosure",
    image: left,
    position: { pan: -158.31, tilt: -6.88, zoom: 1 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  platform: {
    description: "outdoor crow platform",
    image: platform,
    position: { pan: -149.46, tilt: -10.83, zoom: 3240 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  platforminside: {
    description: "indoor crow platform",
    image: platforminside,
    position: { pan: 154.54, tilt: -13, zoom: 3799 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  right: {
    description: "right of crow enclosure",
    image: right,
    position: { pan: -125.31, tilt: -6.38, zoom: 1 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  stick: {
    description: "stick",
    image: stick,
    position: { pan: -136.79, tilt: -30.26, zoom: 1390 },
    // modified: 2025-10-09T11:10:29.836Z
  },
  stickl: {
    description: "stick left",
    image: stickl,
    position: { pan: -146.22, tilt: -30.62, zoom: 4598 },
    // modified: 2025-10-09T11:10:29.836Z
  },
  stickz: {
    description: "stick zoomed in",
    image: stickz,
    position: { pan: -136.17, tilt: -32.89, zoom: 4598 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  table: {
    description: "indoor crow table",
    image: table,
    position: { pan: 135.54, tilt: -24, zoom: 1798 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  training: {
    description: "training area",
    image: training,
    position: { pan: -159.46, tilt: -7.33, zoom: 937 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  tree: {
    description: "perch tree to the left",
    image: tree,
    position: { pan: -176.45, tilt: -5, zoom: 300 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  treeb: {
    description: "perch tree base",
    image: treeb,
    position: { pan: -176.45, tilt: -13, zoom: 2000 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  treebase: {
    description: "very base of tree",
    image: treebase,
    position: { pan: -174.44, tilt: -26, zoom: 2000 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  treet: {
    description: "perch tree top",
    image: treet,
    position: { pan: -176.46, tilt: -1, zoom: 2500 },
    // modified: 2025-10-09T11:10:29.844Z
  },
  water: {
    description: "crow water source",
    image: water,
    position: { pan: -128.91, tilt: -31.15, zoom: 1600 },
    // modified: 2025-10-09T11:10:29.848Z
  },
};

const crowout = {
  title: "Crow Outdoor",
  group: "crow",
  presets: crowoutPresets,
};

export default crowout;
