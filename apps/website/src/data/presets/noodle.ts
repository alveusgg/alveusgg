import closebranch from "@/assets/presets/noodle/closebranch.png";
import closebranchr from "@/assets/presets/noodle/closebranchr.png";
import down from "@/assets/presets/noodle/down.png";
import farbranches from "@/assets/presets/noodle/farbranches.png";
import farrock from "@/assets/presets/noodle/farrock.png";
import home from "@/assets/presets/noodle/home.png";
import left from "@/assets/presets/noodle/left.png";
import leftshelf from "@/assets/presets/noodle/leftshelf.png";
import water from "@/assets/presets/noodle/water.png";

import type { Preset } from "../tech/cameras.types";

const noodlePresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  closebranch: {
    description: "Close branch",
    image: closebranch,
  },
  closebranchr: {
    description: "Close branch right",
    image: closebranchr,
  },
  down: {
    description: "Down",
    image: down,
  },
  farbranches: {
    description: "Far branches",
    image: farbranches,
  },
  farrock: {
    description: "Far rock",
    image: farrock,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftshelf: {
    description: "Left Shelf",
    image: leftshelf,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const noodle = {
  title: "Noodle",
  group: "noodle",
  presets: noodlePresets,
};

export default noodle;
