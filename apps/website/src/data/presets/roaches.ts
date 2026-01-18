import down from "@/assets/presets/roaches/down.png";
import downr from "@/assets/presets/roaches/downr.png";
import food from "@/assets/presets/roaches/food.png";
import home from "@/assets/presets/roaches/home.png";
import left from "@/assets/presets/roaches/left.png";
import right from "@/assets/presets/roaches/right.png";
import sticklt from "@/assets/presets/roaches/sticklt.png";
import stickr from "@/assets/presets/roaches/stickr.png";
import stickrt from "@/assets/presets/roaches/stickrt.png";

import type { Preset } from "../tech/cameras.types";

const roachesPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 97.7, tilt: -25.91, zoom: 1 },
    // modified: 2025-10-27T21:52:07.447Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 161.47, tilt: -86.13, zoom: 1 },
    // modified: 2025-10-09T11:10:30.432Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    position: { pan: -135.23, tilt: -87.33, zoom: 524 },
    // modified: 2025-10-09T11:10:30.436Z
  },
  food: {
    description: "Food",
    image: food,
    position: { pan: 96.45, tilt: -58.76, zoom: 1 },
    // modified: 2025-10-09T11:10:30.432Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: 87.25, tilt: -17.88, zoom: 1 },
    // modified: 2025-10-09T11:10:30.436Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 150.98, tilt: -22.04, zoom: 1 },
    // modified: 2025-10-09T11:10:30.432Z
  },
  sticklt: {
    description: "Stick Left Top",
    image: sticklt,
    position: { pan: 91.98, tilt: -8.39, zoom: 1648 },
    // modified: 2025-10-09T11:10:30.436Z
  },
  stickr: {
    description: "Stick Right",
    image: stickr,
    position: { pan: 173.21, tilt: -13.87, zoom: 1 },
    // modified: 2025-10-09T11:10:30.436Z
  },
  stickrt: {
    description: "Stick Right Top",
    image: stickrt,
    position: { pan: 171.55, tilt: -9.75, zoom: 1423 },
    // modified: 2025-10-09T11:10:30.440Z
  },
};

const roaches = {
  title: "Roaches",
  group: "roaches",
  presets: roachesPresets,
};

export default roaches;
