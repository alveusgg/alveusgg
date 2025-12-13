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
    // modified: 2025-10-27T21:52:07.447Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.432Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    // modified: 2025-10-09T11:10:30.436Z
  },
  food: {
    description: "Food",
    image: food,
    // modified: 2025-10-09T11:10:30.432Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-09T11:10:30.436Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:30.432Z
  },
  sticklt: {
    description: "Stick Left Top",
    image: sticklt,
    // modified: 2025-10-09T11:10:30.436Z
  },
  stickr: {
    description: "Stick Right",
    image: stickr,
    // modified: 2025-10-09T11:10:30.436Z
  },
  stickrt: {
    description: "Stick Right Top",
    image: stickrt,
    // modified: 2025-10-09T11:10:30.440Z
  },
};

const roaches = {
  title: "Roaches",
  group: "roaches",
  presets: roachesPresets,
};

export default roaches;
