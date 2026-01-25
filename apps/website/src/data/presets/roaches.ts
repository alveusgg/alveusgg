import down from "@/assets/presets/roaches/down.png";
import food from "@/assets/presets/roaches/food.png";
import home from "@/assets/presets/roaches/home.png";
import left from "@/assets/presets/roaches/left.png";
import right from "@/assets/presets/roaches/right.png";
import stickt from "@/assets/presets/roaches/stickt.png";

import type { Preset } from "../tech/cameras.types";

const roachesPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -51.04, tilt: -37.64, zoom: 524 },
    // modified: 2026-01-24T22:50:39.779Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -53.85, tilt: -70.61, zoom: 524 },
    // modified: 2026-01-24T22:54:53.415Z
  },
  food: {
    description: "Food",
    image: food,
    position: { pan: -135.23, tilt: -87.33, zoom: 524 },
    // modified: 2026-01-24T22:48:10.244Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -93.72, tilt: -46.68, zoom: 524 },
    // modified: 2026-01-24T22:50:01.410Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -9.93, tilt: -29.7, zoom: 524 },
    // modified: 2026-01-24T22:51:49.676Z
  },
  stickt: {
    description: "stickt",
    image: stickt,
    position: { pan: -83.03, tilt: -8.66, zoom: 524 },
    // modified: 2026-01-24T22:53:00.153Z
  },
};

const roaches = {
  title: "Roaches",
  group: "roaches",
  presets: roachesPresets,
};

export default roaches;
