import backleft from "@/assets/presets/hank/backleft.png";
import backright from "@/assets/presets/hank/backright.png";
import center from "@/assets/presets/hank/center.png";
import downleft from "@/assets/presets/hank/downleft.png";
import downright from "@/assets/presets/hank/downright.png";
import home from "@/assets/presets/hank/home.png";
import water from "@/assets/presets/hank/water.png";

import type { Preset } from "../tech/cameras.types";

const hankPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:29.904Z
  },
  backleft: {
    description: "Back Left",
    image: backleft,
    // modified: 2025-10-09T11:10:29.900Z
  },
  backright: {
    description: "Back Right",
    image: backright,
    // modified: 2025-10-09T11:10:29.904Z
  },
  center: {
    description: "Center",
    image: center,
    // modified: 2025-10-09T11:10:29.900Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    // modified: 2025-10-09T11:10:29.900Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    // modified: 2025-10-09T11:10:29.900Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:29.900Z
  },
};

const hank = {
  title: "Hank",
  group: "hank",
  presets: hankPresets,
};

export default hank;
