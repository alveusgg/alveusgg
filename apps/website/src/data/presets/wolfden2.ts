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
    // modified: 2025-10-09T11:10:30.388Z
  },
  bottomright: {
    description: "Bottom Right",
    image: bottomright,
    // modified: 2025-10-09T11:10:30.388Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-09T11:10:30.388Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    // modified: 2025-10-09T11:10:30.388Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    // modified: 2025-10-09T11:10:30.388Z
  },
};

const wolfden2 = {
  title: "Wolf Den 2",
  group: "wolf",
  presets: wolfden2Presets,
};

export default wolfden2;
