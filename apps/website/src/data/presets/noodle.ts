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
    // modified: 2025-10-09T11:10:29.972Z
  },
  closebranch: {
    description: "Close branch",
    image: closebranch,
    // modified: 2025-10-09T11:10:29.972Z
  },
  closebranchr: {
    description: "Close branch right",
    image: closebranchr,
    // modified: 2025-10-09T11:10:29.968Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:29.972Z
  },
  farbranches: {
    description: "Far branches",
    image: farbranches,
    // modified: 2025-10-09T11:10:29.972Z
  },
  farrock: {
    description: "Far rock",
    image: farrock,
    // modified: 2025-10-09T11:10:29.972Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-09T11:10:29.972Z
  },
  leftshelf: {
    description: "Left Shelf",
    image: leftshelf,
    // modified: 2025-10-09T11:10:29.968Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:29.972Z
  },
};

const noodle = {
  title: "Noodle",
  group: "noodle",
  presets: noodlePresets,
};

export default noodle;
