import den1 from "@/assets/presets/fox/den1.png";
import den1t from "@/assets/presets/fox/den1t.png";
import den2 from "@/assets/presets/fox/den2.png";
import dirtpile from "@/assets/presets/fox/dirtpile.png";
import doorleft from "@/assets/presets/fox/doorleft.png";
import doorright from "@/assets/presets/fox/doorright.png";
import downleft from "@/assets/presets/fox/downleft.png";
import downright from "@/assets/presets/fox/downright.png";
import farcorner from "@/assets/presets/fox/farcorner.png";
import home from "@/assets/presets/fox/home.png";
import insideleft from "@/assets/presets/fox/insideleft.png";
import insideright from "@/assets/presets/fox/insideright.png";
import left from "@/assets/presets/fox/left.png";
import leftplatform from "@/assets/presets/fox/leftplatform.png";
import middleplatform from "@/assets/presets/fox/middleplatform.png";
import reed from "@/assets/presets/fox/reed.png";
import right from "@/assets/presets/fox/right.png";
import rightplatform from "@/assets/presets/fox/rightplatform.png";
import rightramp from "@/assets/presets/fox/rightramp.png";
import river from "@/assets/presets/fox/river.png";

import type { Preset } from "../tech/cameras.types";

const foxPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    // modified: 2025-12-13T18:01:21.562Z
  },
  den1: {
    description: "den1",
    image: den1,
    // modified: 2025-12-13T18:21:14.116Z
  },
  den1t: {
    description: "den1t",
    image: den1t,
    // modified: 2025-12-13T15:35:57.034Z
  },
  den2: {
    description: "den2",
    image: den2,
    // modified: 2025-12-13T18:22:27.505Z
  },
  dirtpile: {
    description: "dirtpile",
    image: dirtpile,
    // modified: 2025-12-13T18:16:32.644Z
  },
  doorleft: {
    description: "doorleft",
    image: doorleft,
    // modified: 2025-12-13T18:27:15.310Z
  },
  doorright: {
    description: "doorright",
    image: doorright,
    // modified: 2025-12-13T18:26:47.245Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    // modified: 2025-12-13T18:17:51.469Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    // modified: 2025-12-13T18:20:33.520Z
  },
  farcorner: {
    description: "farcorner",
    image: farcorner,
    // modified: 2025-12-13T18:26:14.225Z
  },
  insideleft: {
    description: "insideleft",
    image: insideleft,
    // modified: 2025-12-14T20:09:15.410Z
  },
  insideright: {
    description: "insideright",
    image: insideright,
    // modified: 2025-12-14T20:07:21.836Z
  },
  left: {
    description: "left",
    image: left,
    // modified: 2025-12-13T18:17:07.908Z
  },
  leftplatform: {
    description: "leftplatform",
    image: leftplatform,
    // modified: 2025-12-13T18:19:34.095Z
  },
  middleplatform: {
    description: "middleplatform",
    image: middleplatform,
    // modified: 2025-12-13T18:20:04.315Z
  },
  reed: {
    description: "reed",
    image: reed,
    // modified: 2025-12-13T03:23:06.731Z
  },
  right: {
    description: "right",
    image: right,
    // modified: 2025-12-13T18:15:59.683Z
  },
  rightplatform: {
    description: "rightplatform",
    image: rightplatform,
    // modified: 2025-12-13T18:24:52.292Z
  },
  rightramp: {
    description: "rightramp",
    image: rightramp,
    // modified: 2025-12-13T18:18:29.562Z
  },
  river: {
    description: "river",
    image: river,
    // modified: 2025-12-13T18:15:17.407Z
  },
};

const fox = {
  title: "Fox",
  group: "fox",
  presets: foxPresets,
};

export default fox;
