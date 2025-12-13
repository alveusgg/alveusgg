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
    // modified: 2025-10-09T11:10:30.364Z
  },
  closerock: {
    description: "Close Rock",
    image: closerock,
    // modified: 2025-11-30T18:58:30.606Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.360Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    // modified: 2025-10-09T11:10:30.364Z
  },
  far: {
    description: "Far",
    image: far,
    // modified: 2025-10-09T11:10:30.364Z
  },
  food: {
    description: "Food",
    image: food,
    // modified: 2025-10-09T11:10:30.364Z
  },
  log: {
    description: "Log",
    image: log,
    // modified: 2025-10-09T11:10:30.364Z
  },
  logz: {
    description: "Log zoomed",
    image: logz,
    // modified: 2025-10-09T11:10:30.364Z
  },
  rocksandwich: {
    description: "Rock Sandwich",
    image: rocksandwich,
    // modified: 2025-11-30T18:58:30.610Z
  },
  toastsleep: {
    description: "toastsleep",
    image: toastsleep,
    // modified: 2025-10-09T11:10:30.360Z
  },
  tunnel: {
    description: "Tunnel",
    image: tunnel,
    // modified: 2025-10-09T11:10:30.360Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:30.364Z
  },
};

const toast = {
  title: "Toast",
  group: "toast",
  presets: toastPresets,
};

export default toast;
