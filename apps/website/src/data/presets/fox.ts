import { type StaticImageData } from "next/image";

import belowplatform from "@/assets/presets/fox/belowplatform.png";
import belowplatformz from "@/assets/presets/fox/belowplatformz.png";
import belowramp from "@/assets/presets/fox/belowramp.png";
import bench from "@/assets/presets/fox/bench.png";
import brush from "@/assets/presets/fox/brush.png";
import center from "@/assets/presets/fox/center.png";
import den from "@/assets/presets/fox/den.png";
import denf from "@/assets/presets/fox/denf.png";
import denl from "@/assets/presets/fox/denl.png";
import denr from "@/assets/presets/fox/denr.png";
import down from "@/assets/presets/fox/down.png";
import downleft from "@/assets/presets/fox/downleft.png";
import downright from "@/assets/presets/fox/downright.png";
import entry from "@/assets/presets/fox/entry.png";
import home from "@/assets/presets/fox/home.png";
import insidedoor from "@/assets/presets/fox/insidedoor.png";
import left from "@/assets/presets/fox/left.png";
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
import treeclimb from "@/assets/presets/fox/treeclimb.png";
import treehouse from "@/assets/presets/fox/treehouse.png";
import treehousel from "@/assets/presets/fox/treehousel.png";
import treehouser from "@/assets/presets/fox/treehouser.png";

//import bed from "@/assets/presets/fox/bed.png";
//import behindtree from "@/assets/presets/fox/behindtree.png";
//import centerleft from "@/assets/presets/fox/centerleft.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const foxPresets: Record<string, Preset> = {
  belowplatform: {
    description: "Below Platform",
    image: belowplatform,
  },
  belowplatformz: {
    description: "Below Platform Z",
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
  den: {
    description: "Den",
    image: den,
  },
  denf: {
    description: "Den Front",
    image: denf,
  },
  denl: {
    description: "Den Left",
    image: denl,
  },
  denr: {
    description: "Den Right",
    image: denr,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  down: {
    description: "Down",
    image: down,
  },
  entry: {
    description: "Entry",
    image: entry,
  },
  home: {
    description: "Home",
    image: home,
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
  },
  leftfence: {
    description: "Left Fence",
    image: leftfence,
  },
  lefttraining: {
    description: "Left Training",
    image: lefttraining,
  },
  righttraining: {
    description: "Right Training",
    image: righttraining,
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
  },
  rampt: {
    description: "Ramp Top",
    image: rampt,
  },
  rampl: {
    description: "Ramp Left",
    image: rampl,
  },
  platformbl: {
    description: "Platform Bottom Left",
    image: platformbl,
  },
  platformbr: {
    description: "Platform Bottom Right",
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
  platform: {
    description: "Platform",
    image: platform,
  },
  left: {
    description: "Left",
    image: left,
  },
  right: {
    description: "Right",
    image: right,
  },
  shade: {
    description: "Shade",
    image: shade,
  },
  table: {
    description: "Table",
    image: table,
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
  bed: {
    description: "Bed",
    //image: bed,
  },
  behindtree: {
    description: "Behind Tree",
    //image: behindtree,
  },
  centerleft: {
    description: "Center Left",
    //image: centerleft,
  },
};

const fox = {
  title: "Fox",
  presets: foxPresets,
};

export default fox;
