import backleft from "@/assets/presets/hank/backleft.png";
import backright from "@/assets/presets/hank/backright.png";
import center from "@/assets/presets/hank/center.png";
import downleft from "@/assets/presets/hank/downleft.png";
import downright from "@/assets/presets/hank/downright.png";
import home from "@/assets/presets/hank/home.png";
import water from "@/assets/presets/hank/water.png";

import type { Preset } from "../tech/cameras.types";

const hankPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  backleft: {
    description: "Back Left",
    image: backleft,
  },
  backright: {
    description: "Back Right",
    image: backright,
  },
  center: {
    description: "Center",
    image: center,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const hank = {
  title: "Hank",
  group: "hank",
  presets: hankPresets,
};

export default hank;
