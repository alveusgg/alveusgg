import awning from "@/assets/presets/littles/awning.png";
import bowll from "@/assets/presets/littles/bowll.png";
import bowlm from "@/assets/presets/littles/bowlm.png";
import bowlr from "@/assets/presets/littles/bowlr.png";
import down from "@/assets/presets/littles/down.png";
import floorr from "@/assets/presets/littles/floorr.png";
import home from "@/assets/presets/littles/home.png";
import inside from "@/assets/presets/littles/inside.png";
import left from "@/assets/presets/littles/left.png";
import leftb from "@/assets/presets/littles/leftb.png";
import leftback from "@/assets/presets/littles/leftback.png";
import leftcorner from "@/assets/presets/littles/leftcorner.png";
import macawsinside from "@/assets/presets/littles/macawsinside.png";
import miasleep from "@/assets/presets/littles/miasleep.png";
import right from "@/assets/presets/littles/right.png";
import sirensleep from "@/assets/presets/littles/sirensleep.png";
import water from "@/assets/presets/littles/water.png";
import waterl from "@/assets/presets/littles/waterl.png";
import window from "@/assets/presets/littles/window.png";
import winl from "@/assets/presets/littles/winl.png";

import type { Preset } from "../tech/cameras.types";

const littlesPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  awning: {
    description: "awning",
    image: awning,
  },
  bowll: {
    description: "bowll",
    image: bowll,
  },
  bowlm: {
    description: "bowlm",
    image: bowlm,
  },
  bowlr: {
    description: "bowlr",
    image: bowlr,
  },
  down: {
    description: "Down",
    image: down,
  },
  floorr: {
    description: "Floor Right",
    image: floorr,
  },
  inside: {
    description: "inside",
    image: inside,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftb: {
    description: "Left Bottom",
    image: leftb,
  },
  leftback: {
    description: "leftback",
    image: leftback,
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
  },
  macawsinside: {
    description: "macawsinside",
    image: macawsinside,
  },
  miasleep: {
    description: "miasleep",
    image: miasleep,
  },
  right: {
    description: "Right",
    image: right,
  },
  sirensleep: {
    description: "sirensleep",
    image: sirensleep,
  },
  water: {
    description: "Water",
    image: water,
  },
  waterl: {
    description: "waterl",
    image: waterl,
  },
  window: {
    description: "Window",
    image: window,
  },
  winl: {
    description: "winl",
    image: winl,
  },
};

const littles = {
  title: "Littles",
  group: "parrot",
  presets: littlesPresets,
};

export default littles;
