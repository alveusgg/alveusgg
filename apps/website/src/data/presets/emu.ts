import fargate from "@/assets/presets/emu/fargate.png";
import food from "@/assets/presets/emu/food.png";
import home from "@/assets/presets/emu/home.png";
import left from "@/assets/presets/emu/left.png";
import leftcorner from "@/assets/presets/emu/leftcorner.png";
import leftgate from "@/assets/presets/emu/leftgate.png";
import maingate from "@/assets/presets/emu/maingate.png";
import pond from "@/assets/presets/emu/pond.png";
import pondleft from "@/assets/presets/emu/pondleft.png";
import right from "@/assets/presets/emu/right.png";
import rightcorner from "@/assets/presets/emu/rightcorner.png";
import shelter from "@/assets/presets/emu/shelter.png";

import type { Preset } from "../tech/cameras.types";

const emuPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -47.33, tilt: -8.19, zoom: 1 },
    // modified: 2026-06-01T22:46:08.575Z
  },
  fargate: {
    description: "fargate",
    image: fargate,
    position: { pan: -96.34, tilt: -1.68, zoom: 813 },
    // modified: 2026-06-01T22:21:14.756Z
  },
  food: {
    description: "food",
    image: food,
    position: { pan: -50.91, tilt: -3.84, zoom: 1545 },
    // modified: 2026-06-01T22:25:50.180Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -172.51, tilt: -3.18, zoom: 1 },
    // modified: 2026-06-01T22:34:14.756Z
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
    position: { pan: 178.82, tilt: -0.49, zoom: 399 },
    // modified: 2026-06-01T22:37:35.851Z
  },
  leftgate: {
    description: "leftgate",
    image: leftgate,
    position: { pan: -157.29, tilt: -0.38, zoom: 873 },
    // modified: 2026-06-01T21:49:38.659Z
  },
  maingate: {
    description: "maingate",
    image: maingate,
    position: { pan: -22.76, tilt: -6.83, zoom: 813 },
    // modified: 2026-06-01T22:27:44.214Z
  },
  pond: {
    description: "pond",
    image: pond,
    position: { pan: -98.03, tilt: -14.03, zoom: 1 },
    // modified: 2026-06-01T21:39:38.608Z
  },
  pondleft: {
    description: "pondleft",
    image: pondleft,
    position: { pan: -145.11, tilt: -2.69, zoom: 1 },
    // modified: 2026-06-01T22:43:15.068Z
  },
  right: {
    description: "right",
    image: right,
    position: { pan: -41.62, tilt: -6.09, zoom: 1 },
    // modified: 2026-06-01T22:26:47.449Z
  },
  rightcorner: {
    description: "rightcorner",
    image: rightcorner,
    position: { pan: -26.16, tilt: -5.17, zoom: 1422 },
    // modified: 2026-06-01T22:28:21.434Z
  },
  shelter: {
    description: "shelter",
    image: shelter,
    position: { pan: -114.96, tilt: -1.84, zoom: 813 },
    // modified: 2026-06-01T22:22:00.044Z
  },
};

const emu = {
  title: "Emu",
  group: "emu",
  presets: emuPresets,
};

export default emu;
