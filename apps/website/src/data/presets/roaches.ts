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
  },
  down: {
    description: "Down",
    image: down,
  },
  downr: {
    description: "Down Right",
    image: downr,
  },
  food: {
    description: "Food",
    image: food,
  },
  left: {
    description: "Left",
    image: left,
  },
  right: {
    description: "Right",
    image: right,
  },
  sticklt: {
    description: "Stick Left Top",
    image: sticklt,
  },
  stickr: {
    description: "Stick Right",
    image: stickr,
  },
  stickrt: {
    description: "Stick Right Top",
    image: stickrt,
  },
};

const roaches = {
  title: "Roaches",
  group: "roaches",
  presets: roachesPresets,
};

export default roaches;
