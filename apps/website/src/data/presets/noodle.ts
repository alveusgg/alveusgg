import { type StaticImageData } from "next/image";

import closebranch from "@/assets/presets/noodle/closebranch.png";
import down from "@/assets/presets/noodle/down.png";
import farbranches from "@/assets/presets/noodle/farbranches.png";
import home from "@/assets/presets/noodle/home.png";
import left from "@/assets/presets/noodle/left.png";
import water from "@/assets/presets/noodle/water.png";

//import farrock from "@/assets/presets/noodle/farrock.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const noodlePresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  left: {
    description: "Left",
    image: left,
  },
  down: {
    description: "Down",
    image: down,
  },
  water: {
    description: "Water",
    image: water,
  },
  farbranches: {
    description: "Far branches",
    image: farbranches,
  },
  closebranch: {
    description: "Close branch",
    image: closebranch,
  },
  farrock: {
    description: "Far rock",
    //image: farrock,
  },
};

const noodle = {
  title: "Noodle",
  presets: noodlePresets,
};

export default noodle;
