import bottomright from "@/assets/presets/wolfden2/bottomright.png";
import home from "@/assets/presets/wolfden2/home.png";
import left from "@/assets/presets/wolfden2/left.png";
import leftcorner from "@/assets/presets/wolfden2/leftcorner.png";
import rightcorner from "@/assets/presets/wolfden2/rightcorner.png";

import type { Preset } from "../tech/cameras.types";

const wolfden2Presets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.388Z
  },
  bottomright: {
    description: "Bottom Right",
    image: bottomright,
    position: { pan: 68.06, tilt: -67, zoom: 5455 },
    // modified: 2025-10-09T11:10:30.388Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -44.25, tilt: 66, zoom: 4001 },
    // modified: 2025-10-09T11:10:30.388Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -75.83, tilt: -75.83, zoom: 4597 },
    // modified: 2025-10-09T11:10:30.388Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    position: { pan: 65.06, tilt: -19.83, zoom: 5000 },
    // modified: 2025-10-09T11:10:30.388Z
  },
};

const wolfden2 = {
  title: "Wolf Den 2",
  group: "wolf",
  presets: wolfden2Presets,
};

export default wolfden2;
