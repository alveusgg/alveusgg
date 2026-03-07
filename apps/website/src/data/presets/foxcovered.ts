import home from "@/assets/presets/foxcovered/home.png";
import left from "@/assets/presets/foxcovered/left.png";
import platform from "@/assets/presets/foxcovered/platform.png";
import rampb from "@/assets/presets/foxcovered/rampb.png";
import right from "@/assets/presets/foxcovered/right.png";

import type { Preset } from "../tech/cameras.types";

const foxcoveredPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -108.2, tilt: -8.67, zoom: 1 },
    // modified: 2026-03-05T14:21:33.354Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -131.47, tilt: -4.99, zoom: 100 },
    // modified: 2026-03-05T14:24:51.089Z
  },
  platform: {
    description: "platform",
    image: platform,
    position: { pan: -130.47, tilt: 0, zoom: 500 },
    // modified: 2026-03-05T14:23:44.204Z
  },
  rampb: {
    description: "rampb",
    image: rampb,
    position: { pan: -130.21, tilt: -4.86, zoom: 2185 },
    // modified: 2026-03-06T02:44:06.603Z
  },
  right: {
    description: "right",
    image: right,
    position: { pan: -59.47, tilt: -17.34, zoom: 1 },
    // modified: 2026-03-05T14:26:42.515Z
  },
};

const foxcovered = {
  title: "Fox Covered",
  group: "fox",
  presets: foxcoveredPresets,
};

export default foxcovered;
