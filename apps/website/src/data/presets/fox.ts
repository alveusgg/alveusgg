import bed from "@/assets/presets/fox/bed.png";
import behindtree from "@/assets/presets/fox/behindtree.png";
import belowplatform from "@/assets/presets/fox/belowplatform.png";
import belowplatformz from "@/assets/presets/fox/belowplatformz.png";
import belowramp from "@/assets/presets/fox/belowramp.png";
import bench from "@/assets/presets/fox/bench.png";
import brush from "@/assets/presets/fox/brush.png";
import center from "@/assets/presets/fox/center.png";
import centerleft from "@/assets/presets/fox/centerleft.png";
import den from "@/assets/presets/fox/den.png";
import denf from "@/assets/presets/fox/denf.png";
import denfl from "@/assets/presets/fox/denfl.png";
import denl from "@/assets/presets/fox/denl.png";
import denr from "@/assets/presets/fox/denr.png";
import down from "@/assets/presets/fox/down.png";
import downleft from "@/assets/presets/fox/downleft.png";
import downright from "@/assets/presets/fox/downright.png";
import entry from "@/assets/presets/fox/entry.png";
import home from "@/assets/presets/fox/home.png";
import insidedoor from "@/assets/presets/fox/insidedoor.png";
import left from "@/assets/presets/fox/left.png";
import leftcorner from "@/assets/presets/fox/leftcorner.png";
import leftfence from "@/assets/presets/fox/leftfence.png";
import lefttraining from "@/assets/presets/fox/lefttraining.png";
import platform from "@/assets/presets/fox/platform.png";
import platformbl from "@/assets/presets/fox/platformbl.png";
import platformbr from "@/assets/presets/fox/platformbr.png";
import platformfl from "@/assets/presets/fox/platformfl.png";
import platformfr from "@/assets/presets/fox/platformfr.png";
import platforml from "@/assets/presets/fox/platforml.png";
import rampl from "@/assets/presets/fox/rampl.png";
import rampt from "@/assets/presets/fox/rampt.png";
import right from "@/assets/presets/fox/right.png";
import rightcorner from "@/assets/presets/fox/rightcorner.png";
import righttraining from "@/assets/presets/fox/righttraining.png";
import shade from "@/assets/presets/fox/shade.png";
import table from "@/assets/presets/fox/table.png";
import temp from "@/assets/presets/fox/temp.png";
import treeclimb from "@/assets/presets/fox/treeclimb.png";
import treehouse from "@/assets/presets/fox/treehouse.png";
import treehousel from "@/assets/presets/fox/treehousel.png";
import treehouser from "@/assets/presets/fox/treehouser.png";
import treer from "@/assets/presets/fox/treer.png";

import type { Preset } from "../tech/cameras.types";

const foxPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  bed: {
    description: "Bed (old)",
    image: bed,
  },
  behindtree: {
    description: "Behind Tree (below platform)",
    image: behindtree,
  },
  belowplatform: {
    description: "Below Platform",
    image: belowplatform,
  },
  belowplatformz: {
    description: "Below Platform Zoomed",
    image: belowplatformz,
  },
  belowramp: {
    description: "Below Ramp",
    image: belowramp,
  },
  bench: {
    description: "Bench",
    image: bench,
  },
  brush: {
    description: "Brush",
    image: brush,
  },
  center: {
    description: "Center",
    image: center,
  },
  centerleft: {
    description: "Center Left",
    image: centerleft,
  },
  den: {
    description: "Den",
    image: den,
  },
  denf: {
    description: "Den Far",
    image: denf,
  },
  denfl: {
    description: "Den Far Left",
    image: denfl,
  },
  denl: {
    description: "Den Left",
    image: denl,
  },
  denr: {
    description: "Den Right",
    image: denr,
  },
  down: {
    description: "Down",
    image: down,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  entry: {
    description: "Entry",
    image: entry,
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
  leftfence: {
    description: "Left Fence",
    image: leftfence,
  },
  lefttraining: {
    description: "Left Training",
    image: lefttraining,
  },
  platform: {
    description: "Platform",
    image: platform,
  },
  platformbl: {
    description: "Platform Back Left",
    image: platformbl,
  },
  platformbr: {
    description: "Platform Back Right",
    image: platformbr,
  },
  platformfl: {
    description: "Platform Front Left",
    image: platformfl,
  },
  platformfr: {
    description: "Platform Front Right",
    image: platformfr,
  },
  platforml: {
    description: "Platform Left",
    image: platforml,
  },
  rampl: {
    description: "Ramp Left",
    image: rampl,
  },
  rampt: {
    description: "Ramp Top",
    image: rampt,
  },
  right: {
    description: "Right",
    image: right,
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
  },
  righttraining: {
    description: "Right Training",
    image: righttraining,
  },
  shade: {
    description: "Shade",
    image: shade,
  },
  table: {
    description: "Table",
    image: table,
  },
  temp: {
    description: "temp",
    image: temp,
  },
  treeclimb: {
    description: "Tree Climb",
    image: treeclimb,
  },
  treehouse: {
    description: "Tree House",
    image: treehouse,
  },
  treehousel: {
    description: "Tree House Left",
    image: treehousel,
  },
  treehouser: {
    description: "Tree House Right",
    image: treehouser,
  },
  treer: {
    description: "Tree Right",
    image: treer,
  },
};

const fox = {
  title: "Fox",
  group: "fox",
  presets: foxPresets,
};

export default fox;
