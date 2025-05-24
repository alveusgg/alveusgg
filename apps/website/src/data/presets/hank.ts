import { type StaticImageData } from "next/image";

import home from "@/assets/presets/hank/home.png";
import water from "@/assets/presets/hank/water.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

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
  presets: hankPresets,
};

export default hank;
