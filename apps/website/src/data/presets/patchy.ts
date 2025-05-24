import closebranches from "@/assets/presets/patchy/closebranches.png";
import down from "@/assets/presets/patchy/down.png";
import farbranches from "@/assets/presets/patchy/farbranches.png";
import groundm from "@/assets/presets/patchy/groundm.png";
import home from "@/assets/presets/patchy/home.png";
import water from "@/assets/presets/patchy/water.png";

import type { Preset } from "./preset";

const patchyPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  closebranches: {
    description: "Close Branches",
    image: closebranches,
  },
  down: {
    description: "Down",
    image: down,
  },
  farbranches: {
    description: "Far Branches",
    image: farbranches,
  },
  groundm: {
    description: "Ground Middle",
    image: groundm,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const patchy = {
  title: "Patchy",
  presets: patchyPresets,
};

export default patchy;
