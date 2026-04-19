import belowplatforml from "@/assets/presets/foxcovered/belowplatforml.png";
import downleft from "@/assets/presets/foxcovered/downleft.png";
import downright from "@/assets/presets/foxcovered/downright.png";
import farcorner from "@/assets/presets/foxcovered/farcorner.png";
import home from "@/assets/presets/foxcovered/home.png";
import left from "@/assets/presets/foxcovered/left.png";
import middle from "@/assets/presets/foxcovered/middle.png";
import platform from "@/assets/presets/foxcovered/platform.png";
import platformbr from "@/assets/presets/foxcovered/platformbr.png";
import platformfl from "@/assets/presets/foxcovered/platformfl.png";
import platformfr from "@/assets/presets/foxcovered/platformfr.png";
import rampb from "@/assets/presets/foxcovered/rampb.png";
import right from "@/assets/presets/foxcovered/right.png";
import table from "@/assets/presets/foxcovered/table.png";

import type { Preset } from "../tech/cameras.types";

const foxcoveredPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -130.06, tilt: -9.96, zoom: 1 },
    // modified: 2026-04-18T13:15:49.341Z
  },
  belowplatforml: {
    description: "belowplatforml",
    image: belowplatforml,
    position: { pan: -147.72, tilt: -6.81, zoom: 3202 },
    // modified: 2026-04-18T13:21:01.025Z
  },
  downleft: {
    description: "downleft",
    image: downleft,
    position: { pan: -150.87, tilt: -42.97, zoom: 1 },
    // modified: 2026-04-18T13:25:11.973Z
  },
  downright: {
    description: "downright",
    image: downright,
    position: { pan: -45.66, tilt: -44.94, zoom: 1 },
    // modified: 2026-04-18T13:24:27.101Z
  },
  farcorner: {
    description: "farcorner",
    image: farcorner,
    position: { pan: -136.61, tilt: -5.8, zoom: 937 },
    // modified: 2026-04-18T13:26:11.654Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -141.92, tilt: -9.8, zoom: 172 },
    // modified: 2026-04-18T13:22:30.371Z
  },
  middle: {
    description: "middle",
    image: middle,
    position: { pan: -121.34, tilt: -21.42, zoom: 1 },
    // modified: 2026-04-18T13:23:24.036Z
  },
  platform: {
    description: "platform",
    image: platform,
    position: { pan: -143.87, tilt: -0.93, zoom: 1604 },
    // modified: 2026-04-18T13:16:49.326Z
  },
  platformbr: {
    description: "platformbr",
    image: platformbr,
    position: { pan: -142.73, tilt: -1.16, zoom: 4039 },
    // modified: 2026-04-18T13:18:33.995Z
  },
  platformfl: {
    description: "platformfl",
    image: platformfl,
    position: { pan: -146.25, tilt: -1.02, zoom: 4039 },
    // modified: 2026-04-18T13:17:40.010Z
  },
  platformfr: {
    description: "platformfr",
    image: platformfr,
    position: { pan: -140.72, tilt: -1.11, zoom: 3601 },
    // modified: 2026-04-18T13:19:07.544Z
  },
  rampb: {
    description: "rampb",
    image: rampb,
    position: { pan: -141.43, tilt: -6.69, zoom: 2021 },
    // modified: 2026-04-18T13:19:45.312Z
  },
  right: {
    description: "right",
    image: right,
    position: { pan: -72.22, tilt: -25.62, zoom: 1 },
    // modified: 2026-04-18T13:23:57.084Z
  },
  table: {
    description: "table",
    image: table,
    position: { pan: -95.21, tilt: -38.31, zoom: 1 },
    // modified: 2026-04-18T13:27:05.527Z
  },
};

const foxcovered = {
  title: "Fox Covered",
  group: "fox",
  presets: foxcoveredPresets,
};

export default foxcovered;
