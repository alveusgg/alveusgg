import down from "@/assets/presets/littles/down.png";
import floorr from "@/assets/presets/littles/floorr.png";
import home from "@/assets/presets/littles/home.png";
import left from "@/assets/presets/littles/left.png";
import leftb from "@/assets/presets/littles/leftb.png";
import right from "@/assets/presets/littles/right.png";
import water from "@/assets/presets/littles/water.png";
import window from "@/assets/presets/littles/window.png";

import type { Preset } from "../tech/cameras.types";

const littlesPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  down: {
    description: "Down",
    image: down,
  },
  floorr: {
    description: "Floor Right",
    image: floorr,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftb: {
    description: "Left Bottom",
    image: leftb,
  },
  right: {
    description: "Right",
    image: right,
  },
  water: {
    description: "Water",
    image: water,
  },
  window: {
    description: "Window",
    image: window,
  },
  miasleep: { description: "A spot Mia slept at once" },
  sirensleep: { description: "A spot Siren slept at once" },
  bowlr: { description: "Bowl in the back near human door" },
  bowlm: { description: "Bowl in the middle" },
  waterl: { description: "Water close to the camera" },
  bowll: { description: "Bowl close to the camera" },
  winl: { description: "Left of window" },
  awning: { description: "Awning above window" },
  inside: { description: "Close up inside window" },
};

const littles = {
  title: "Littles",
  group: "parrot",
  presets: littlesPresets,
};

export default littles;
