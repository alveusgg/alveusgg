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
    position: { pan: 2.77, tilt: -14.45, zoom: 1 },
    // modified: 2025-10-09T11:10:29.972Z
  },
  closebranch: {
    description: "Close branch",
    image: closebranch,
    position: { pan: -53.82, tilt: -32.67, zoom: 1 },
    // modified: 2025-10-09T11:10:29.972Z
  },
  closebranchr: {
    description: "Close branch right",
    image: closebranchr,
    position: { pan: -19.65, tilt: -27.26, zoom: 1 },
    // modified: 2025-10-09T11:10:29.968Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -37.79, tilt: -64.22, zoom: 1 },
    // modified: 2025-10-09T11:10:29.972Z
  },
  farbranches: {
    description: "Far branches",
    image: farbranches,
    position: { pan: 13.94, tilt: -13.13, zoom: 2221 },
    // modified: 2025-10-09T11:10:29.972Z
  },
  farrock: {
    description: "Far rock",
    image: farrock,
    position: { pan: 2.77, tilt: -2.26, zoom: 3887 },
    // modified: 2025-10-09T11:10:29.972Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -52.07, tilt: -16.05, zoom: 1 },
    // modified: 2025-10-09T11:10:29.972Z
  },
  leftshelf: {
    description: "Left Shelf",
    image: leftshelf,
    position: { pan: -56.15, tilt: 0, zoom: 489 },
    // modified: 2025-10-09T11:10:29.968Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: 3.45, tilt: -48.11, zoom: 556 },
    // modified: 2025-10-09T11:10:29.972Z
  },
};

const noodle = {
  title: "Noodle",
  group: "noodle",
  presets: noodlePresets,
};

export default noodle;
