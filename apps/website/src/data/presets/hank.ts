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
    position: { pan: -17.04, tilt: -66.41, zoom: 1 },
    // modified: 2025-10-09T11:10:29.904Z
  },
  backleft: {
    description: "Back Left",
    image: backleft,
    position: { pan: -32.36, tilt: -47.7, zoom: 1739 },
    // modified: 2025-10-09T11:10:29.900Z
  },
  backright: {
    description: "Back Right",
    image: backright,
    position: { pan: 48.85, tilt: -49.76, zoom: 1739 },
    // modified: 2025-10-09T11:10:29.904Z
  },
  center: {
    description: "Center",
    image: center,
    position: { pan: -1.78, tilt: -68.88, zoom: 1 },
    // modified: 2025-10-09T11:10:29.900Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    position: { pan: -55.87, tilt: -66.26, zoom: 834 },
    // modified: 2025-10-09T11:10:29.900Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: 50.92, tilt: -64.79, zoom: 1739 },
    // modified: 2025-10-09T11:10:29.900Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -58.61, tilt: -52.04, zoom: 4113 },
    // modified: 2025-10-09T11:10:29.900Z
  },
};

const hank = {
  title: "Hank",
  group: "hank",
  presets: hankPresets,
};

export default hank;
