import closerock from "@/assets/presets/toast/closerock.png";
import down from "@/assets/presets/toast/down.png";
import downright from "@/assets/presets/toast/downright.png";
import far from "@/assets/presets/toast/far.png";
import food from "@/assets/presets/toast/food.png";
import home from "@/assets/presets/toast/home.png";
import log from "@/assets/presets/toast/log.png";
import logz from "@/assets/presets/toast/logz.png";
import rocksandwich from "@/assets/presets/toast/rocksandwich.png";
import toastsleep from "@/assets/presets/toast/toastsleep.png";
import tunnel from "@/assets/presets/toast/tunnel.png";
import water from "@/assets/presets/toast/water.png";

import type { Preset } from "../tech/cameras.types";

const toastPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  closerock: {
    description: "Close Rock",
    image: closerock,
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
  food: {
    description: "Food",
    image: food,
  },
  log: {
    description: "Log",
    image: log,
  },
  logz: {
    description: "Log zoomed",
    image: logz,
  },
  rocksandwich: {
    description: "Rock Sandwich",
    image: rocksandwich,
  },
  toastsleep: {
    description: "toastsleep",
    image: toastsleep,
  },
  tunnel: {
    description: "Tunnel",
    image: tunnel,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const toast = {
  title: "Toast",
  group: "toast",
  presets: toastPresets,
};

export default toast;
