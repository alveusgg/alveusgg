import { type StaticImageData } from "next/image";

import down from "@/assets/presets/toast/down.png";
import downright from "@/assets/presets/toast/downright.png";
import far from "@/assets/presets/toast/far.png";
import food from "@/assets/presets/toast/food.png";
import home from "@/assets/presets/toast/home.png";
import log from "@/assets/presets/toast/log.png";
import logz from "@/assets/presets/toast/logz.png";
import water from "@/assets/presets/toast/water.png";

//import rocksandwich from "@/assets/presets/toast/rocksandwich.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const toastPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  down: {
    description: "Down",
    image: down,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  far: {
    description: "Far",
    image: far,
  },
  log: {
    description: "Log",
    image: log,
  },
  logz: {
    description: "Log Z",
    image: logz,
  },
  water: {
    description: "Water",
    image: water,
  },
  food: {
    description: "Food",
    image: food,
  },
  rocksandwich: {
    description: "Rock Sandwich",
    //image: rocksandwich,
  },
};

const toast = {
  title: "Toast",
  presets: toastPresets,
};

export default toast;
