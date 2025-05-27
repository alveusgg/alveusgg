import home from "@/assets/presets/hank/home.png";
import water from "@/assets/presets/hank/water.png";

import type { Preset } from "./preset";

const hankPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
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
