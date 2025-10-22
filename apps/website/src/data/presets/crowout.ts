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
  },
  backcorner: {
    description: "back corner perch",
    image: backcorner,
  },
  bench: {
    description: "corner perches",
    image: bench,
  },
  cache: {
    description: "cache",
    image: cache,
  },
  corner: {
    description: "corner perch",
    image: corner,
  },
  cornerc: {
    description: "corner perch zoomed in",
    image: cornerc,
  },
  down: {
    description: "straight down",
    image: down,
  },
  entry: {
    description: "crow indoor entry area",
    image: entry,
  },
  escape: {
    description: "escape hatch",
    image: escape,
  },
  ground: {
    description: "view of the ground",
    image: ground,
  },
  groundl: {
    description: "ground left corner",
    image: groundl,
  },
  groundr: {
    description: "ground right corner",
    image: groundr,
  },
  inside: {
    description: "indoor area",
    image: inside,
  },
  insideperch: {
    description: "view of indoor perch",
    image: insideperch,
  },
  insidewater: {
    description: "indoor water bowl",
    image: insidewater,
  },
  left: {
    description: "left of outdoor crow enclosure",
    image: left,
  },
  platform: {
    description: "outdoor crow platform",
    image: platform,
  },
  platforminside: {
    description: "indoor crow platform",
    image: platforminside,
  },
  right: {
    description: "right of crow enclosure",
    image: right,
  },
  stick: {
    description: "stick",
    image: stick,
  },
  stickl: {
    description: "stick left",
    image: stickl,
  },
  stickz: {
    description: "stick zoomed in",
    image: stickz,
  },
  table: {
    description: "indoor crow table",
    image: table,
  },
  training: {
    description: "training area",
    image: training,
  },
  tree: {
    description: "perch tree to the left",
    image: tree,
  },
  treeb: {
    description: "perch tree base",
    image: treeb,
  },
  treebase: {
    description: "very base of tree",
    image: treebase,
  },
  treet: {
    description: "perch tree top",
    image: treet,
  },
  water: {
    description: "crow water source",
    image: water,
  },
};

const crowout = {
  title: "Crow Outdoor",
  group: "crow",
  presets: crowoutPresets,
};

export default crowout;
