import { type StaticImageData } from "next/image";

import bottomshelfl from "@/assets/presets/marmout/bottomshelfl.png";
import bottomshelfr from "@/assets/presets/marmout/bottomshelfr.png";
import domel from "@/assets/presets/marmout/domel.png";
import domer from "@/assets/presets/marmout/domer.png";
import domes from "@/assets/presets/marmout/domes.png";
// import door from "@/assets/presets/marmout/door.png";
import flapl from "@/assets/presets/marmout/flapl.png";
import flapr from "@/assets/presets/marmout/flapr.png";
import flaps from "@/assets/presets/marmout/flaps.png";
import frontdoor from "@/assets/presets/marmout/frontdoor.png";
import home from "@/assets/presets/marmout/home.png";
import hose from "@/assets/presets/marmout/hose.png";
import ir from "@/assets/presets/marmout/ir.png";
import left from "@/assets/presets/marmout/left.png";
import leftpostshelves from "@/assets/presets/marmout/leftpostshelves.png";
import leftpostshelvesl from "@/assets/presets/marmout/leftpostshelvesl.png";
import platformleft from "@/assets/presets/marmout/platformleft.png";
import post2t from "@/assets/presets/marmout/post2t.png";
import ramp from "@/assets/presets/marmout/ramp.png";
import right from "@/assets/presets/marmout/right.png";
import rightperch from "@/assets/presets/marmout/rightperch.png";
import rightpostb from "@/assets/presets/marmout/rightpostb.png";
import rightscreen from "@/assets/presets/marmout/rightscreen.png";
import rightshelvesb from "@/assets/presets/marmout/rightshelvesb.png";
import rightshelvest from "@/assets/presets/marmout/rightshelvest.png";
import table from "@/assets/presets/marmout/table.png";
import top from "@/assets/presets/marmout/top.png";
import topshelfl from "@/assets/presets/marmout/topshelfl.png";
import topshelfr from "@/assets/presets/marmout/topshelfr.png";

// import rope from "@/assets/presets/marmout/rope.png";
// import rightpost from "@/assets/presets/marmout/rightpost.png";
// import leftpostshelvest from "@/assets/presets/marmout/leftpostshelvest.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const marmoutPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  left: {
    description: "Left",
    image: left,
  },
  right: {
    description: "Right",
    image: right,
  },
  top: {
    description: "Top",
    image: top,
  },
  frontdoor: {
    description: "Front Door",
    image: frontdoor,
  },
  hose: {
    description: "Hose",
    image: hose,
  },
  ir: {
    description: "IR",
    image: ir,
  },
  table: {
    description: "Table",
    image: table,
  },
  ramp: {
    description: "Ramp",
    image: ramp,
  },
  flapl: {
    description: "Flap Left",
    image: flapl,
  },
  flapr: {
    description: "Flap Right",
    image: flapr,
  },
  flaps: {
    description: "Flaps",
    image: flaps,
  },
  domel: {
    description: "Dome Left",
    image: domel,
  },
  domer: {
    description: "Dome Right",
    image: domer,
  },
  domes: {
    description: "Domes",
    image: domes,
  },
  rightshelvest: {
    description: "right shelves top",
    image: rightshelvest,
  },
  rightshelvesb: {
    description: "right shelves bottom",
    image: rightshelvesb,
  },
  rightpostb: {
    description: "right post base",
    image: rightpostb,
  },
  leftpostshelves: {
    description: "left post shelves",
    image: leftpostshelves,
  },
  leftpostshelvesl: {
    description: "left post shelves left side",
    image: leftpostshelvesl,
  },
  topshelfl: {
    description: "top shelf left side",
    image: topshelfl,
  },
  topshelfr: {
    description: "top shelf right side",
    image: topshelfr,
  },
  rightscreen: {
    description: "right screen door to the indoor space",
    image: rightscreen,
  },
  platformleft: {
    description: "Platform Left",
    image: platformleft,
  },
  post2t: {
    description: "Post 2 Top",
    image: post2t,
  },
  leftpostshelvest: {
    description: "Left Post Shelves Top",
    //image: leftpostshelvest,
  },
  rightpost: {
    description: "Right Post",
    //image: rightpost,
  },
  rightperch: {
    description: "Right Perch",
    image: rightperch,
  },
  bottomshelfl: {
    description: "Bottom Shelf Left",
    image: bottomshelfl,
  },
  bottomshelfr: {
    description: "Bottom Shelf Right",
    image: bottomshelfr,
  },
  rope: {
    description: "Rope",
    //image: rope,
  },
  door: {
    description: "Door",
    //image: door,
  },
};

const marmout = {
  title: "Marmoset Outdoor",
  presets: marmoutPresets,
};

export default marmout;
