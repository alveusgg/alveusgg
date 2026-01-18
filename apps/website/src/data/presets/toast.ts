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
    position: { pan: -29.39, tilt: -47.47, zoom: 1 },
    // modified: 2025-10-09T11:10:30.364Z
  },
  closerock: {
    description: "Close Rock",
    image: closerock,
    position: { pan: -11.5, tilt: -23.13, zoom: 1 },
    // modified: 2025-11-30T18:58:30.606Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 8.94, tilt: -79.68, zoom: 1 },
    // modified: 2025-10-09T11:10:30.360Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: 17.05, tilt: -56.17, zoom: 1 },
    // modified: 2025-10-09T11:10:30.364Z
  },
  far: {
    description: "Far",
    image: far,
    position: { pan: -48.07, tilt: -19.87, zoom: 1249 },
    // modified: 2025-10-09T11:10:30.364Z
  },
  food: {
    description: "Food",
    image: food,
    position: { pan: -47.36, tilt: -58.27, zoom: 2500 },
    // modified: 2025-10-09T11:10:30.364Z
  },
  log: {
    description: "Log",
    image: log,
    position: { pan: -56.48, tilt: -46.35, zoom: 2500 },
    // modified: 2025-10-09T11:10:30.364Z
  },
  logz: {
    description: "Log zoomed",
    image: logz,
    position: { pan: -59.38, tilt: -41.02, zoom: 7499 },
    // modified: 2025-10-09T11:10:30.364Z
  },
  rocksandwich: {
    description: "Rock Sandwich",
    image: rocksandwich,
    position: { pan: -41.23, tilt: -11.32, zoom: 9800 },
    // modified: 2025-11-30T18:58:30.610Z
  },
  toastsleep: {
    description: "toastsleep",
    image: toastsleep,
    position: { pan: -38.22, tilt: -51.11, zoom: 1 },
    // modified: 2025-10-09T11:10:30.360Z
  },
  tunnel: {
    description: "Tunnel",
    image: tunnel,
    position: { pan: -58.16, tilt: -31.64, zoom: 2897 },
    // modified: 2025-10-09T11:10:30.360Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -58.03, tilt: -22.76, zoom: 8748 },
    // modified: 2025-10-09T11:10:30.364Z
  },
};

const toast = {
  title: "Toast",
  group: "toast",
  presets: toastPresets,
};

export default toast;
