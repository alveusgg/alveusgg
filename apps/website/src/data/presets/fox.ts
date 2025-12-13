import den1 from "@/assets/presets/fox/den1.png";
import den2 from "@/assets/presets/fox/den2.png";
import dirtpile from "@/assets/presets/fox/dirtpile.png";
import doorleft from "@/assets/presets/fox/doorleft.png";
import doorright from "@/assets/presets/fox/doorright.png";
import downleft from "@/assets/presets/fox/downleft.png";
import downright from "@/assets/presets/fox/downright.png";
import farcorner from "@/assets/presets/fox/farcorner.png";
import home from "@/assets/presets/fox/home.png";
import left from "@/assets/presets/fox/left.png";
import leftplatform from "@/assets/presets/fox/leftplatform.png";
import middleplatform from "@/assets/presets/fox/middleplatform.png";
import reed from "@/assets/presets/fox/reed.png";
import right from "@/assets/presets/fox/right.png";
import rightplatform from "@/assets/presets/fox/rightplatform.png";
import rightramp from "@/assets/presets/fox/rightramp.png";
import river from "@/assets/presets/fox/river.png";

import type { Preset } from "../tech/cameras.types";

const foxPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  den1: {
    description: "den1",
    image: den1,
  },
  den2: {
    description: "den2",
    image: den2,
  },
  dirtpile: {
    description: "dirtpile",
    image: dirtpile,
  },
  doorleft: {
    description: "doorleft",
    image: doorleft,
  },
  doorright: {
    description: "doorright",
    image: doorright,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  farcorner: {
    description: "farcorner",
    image: farcorner,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftplatform: {
    description: "leftplatform",
    image: leftplatform,
  },
  middleplatform: {
    description: "middleplatform",
    image: middleplatform,
  },
  reed: {
    description: "reed",
    image: reed,
  },
  right: {
    description: "Right",
    image: right,
  },
  rightplatform: {
    description: "rightplatform",
    image: rightplatform,
  },
  rightramp: {
    description: "rightramp",
    image: rightramp,
  },
  river: {
    description: "river",
    image: river,
  },
};

const fox = {
  title: "Fox",
  group: "fox",
  presets: foxPresets,
};

export default fox;
