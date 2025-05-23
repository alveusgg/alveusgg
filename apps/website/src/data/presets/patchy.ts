import { type StaticImageData } from "next/image";

import closebranches from "@/assets/presets/patchy/closebranches.png";
import down from "@/assets/presets/patchy/down.png";
import farbranches from "@/assets/presets/patchy/farbranches.png";
import groundm from "@/assets/presets/patchy/groundm.png";
import home from "@/assets/presets/patchy/home.png";
import water from "@/assets/presets/patchy/water.png";

export interface Preset {
  description: string;
  image: StaticImageData;
}

const patchyPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  water: {
    description: "Water",
    image: water,
  },
  down: {
    description: "Down",
    image: down,
  },
  groundm: {
    description: "Ground Middle",
    image: groundm,
  },
  closebranches: {
    description: "Close Branches",
    image: closebranches,
  },
  farbranches: {
    description: "Far Branches",
    image: farbranches,
  },
};

const patchy = {
  title: "Patchy",
  presets: patchyPresets,
};

export default patchy;
