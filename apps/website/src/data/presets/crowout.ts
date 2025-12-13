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
    // modified: 2025-10-09T11:10:29.840Z
  },
  backcorner: {
    description: "back corner perch",
    image: backcorner,
    // modified: 2025-10-09T11:10:29.836Z
  },
  bench: {
    description: "corner perches",
    image: bench,
    // modified: 2025-10-09T11:10:29.836Z
  },
  cache: {
    description: "cache",
    image: cache,
    // modified: 2025-10-09T11:10:29.836Z
  },
  corner: {
    description: "corner perch",
    image: corner,
    // modified: 2025-10-09T11:10:29.836Z
  },
  cornerc: {
    description: "corner perch zoomed in",
    image: cornerc,
    // modified: 2025-10-09T11:10:29.840Z
  },
  down: {
    description: "straight down",
    image: down,
    // modified: 2025-10-09T11:10:29.840Z
  },
  entry: {
    description: "crow indoor entry area",
    image: entry,
    // modified: 2025-10-09T11:10:29.840Z
  },
  escape: {
    description: "escape hatch",
    image: escape,
    // modified: 2025-10-09T11:10:29.840Z
  },
  ground: {
    description: "view of the ground",
    image: ground,
    // modified: 2025-10-09T11:10:29.840Z
  },
  groundl: {
    description: "ground left corner",
    image: groundl,
    // modified: 2025-10-09T11:10:29.840Z
  },
  groundr: {
    description: "ground right corner",
    image: groundr,
    // modified: 2025-10-09T11:10:29.840Z
  },
  inside: {
    description: "indoor area",
    image: inside,
    // modified: 2025-10-09T11:10:29.840Z
  },
  insideperch: {
    description: "view of indoor perch",
    image: insideperch,
    // modified: 2025-10-09T11:10:29.840Z
  },
  insidewater: {
    description: "indoor water bowl",
    image: insidewater,
    // modified: 2025-10-09T11:10:29.840Z
  },
  left: {
    description: "left of outdoor crow enclosure",
    image: left,
    // modified: 2025-10-09T11:10:29.844Z
  },
  platform: {
    description: "outdoor crow platform",
    image: platform,
    // modified: 2025-10-09T11:10:29.844Z
  },
  platforminside: {
    description: "indoor crow platform",
    image: platforminside,
    // modified: 2025-10-09T11:10:29.844Z
  },
  right: {
    description: "right of crow enclosure",
    image: right,
    // modified: 2025-10-09T11:10:29.844Z
  },
  stick: {
    description: "stick",
    image: stick,
    // modified: 2025-10-09T11:10:29.836Z
  },
  stickl: {
    description: "stick left",
    image: stickl,
    // modified: 2025-10-09T11:10:29.836Z
  },
  stickz: {
    description: "stick zoomed in",
    image: stickz,
    // modified: 2025-10-09T11:10:29.844Z
  },
  table: {
    description: "indoor crow table",
    image: table,
    // modified: 2025-10-09T11:10:29.844Z
  },
  training: {
    description: "training area",
    image: training,
    // modified: 2025-10-09T11:10:29.844Z
  },
  tree: {
    description: "perch tree to the left",
    image: tree,
    // modified: 2025-10-09T11:10:29.844Z
  },
  treeb: {
    description: "perch tree base",
    image: treeb,
    // modified: 2025-10-09T11:10:29.844Z
  },
  treebase: {
    description: "very base of tree",
    image: treebase,
    // modified: 2025-10-09T11:10:29.844Z
  },
  treet: {
    description: "perch tree top",
    image: treet,
    // modified: 2025-10-09T11:10:29.844Z
  },
  water: {
    description: "crow water source",
    image: water,
    // modified: 2025-10-09T11:10:29.848Z
  },
};

const crowout = {
  title: "Crow Outdoor",
  group: "crow",
  presets: crowoutPresets,
};

export default crowout;
