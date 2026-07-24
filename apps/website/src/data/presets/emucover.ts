import center from "@/assets/presets/emucover/center.png";
import centerr from "@/assets/presets/emucover/centerr.png";
import down from "@/assets/presets/emucover/down.png";
import downleft from "@/assets/presets/emucover/downleft.png";
import downright from "@/assets/presets/emucover/downright.png";
import farcorner from "@/assets/presets/emucover/farcorner.png";
import feeder from "@/assets/presets/emucover/feeder.png";
import home from "@/assets/presets/emucover/home.png";
import left from "@/assets/presets/emucover/left.png";
import leftcorner from "@/assets/presets/emucover/leftcorner.png";
import leftgrove from "@/assets/presets/emucover/leftgrove.png";
import marmgate from "@/assets/presets/emucover/marmgate.png";
import mudpit from "@/assets/presets/emucover/mudpit.png";
import right from "@/assets/presets/emucover/right.png";
import rightcorner from "@/assets/presets/emucover/rightcorner.png";
import rightgrove from "@/assets/presets/emucover/rightgrove.png";
import shelter from "@/assets/presets/emucover/shelter.png";
import sleep from "@/assets/presets/emucover/sleep.png";

import type { Preset } from "../tech/cameras.types";

const emucoverPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -95.19, tilt: -3.7, zoom: 1 },
    // modified: 2026-06-11T23:41:47.191Z
  },
  center: {
    description: "center",
    image: center,
    position: { pan: -36, tilt: -4.72, zoom: 1 },
    // modified: 2026-06-01T23:09:02.278Z
  },
  centerr: {
    description: "centerr",
    image: centerr,
    position: { pan: -16.58, tilt: -3.27, zoom: 87 },
    // modified: 2026-06-11T23:57:11.229Z
  },
  down: {
    description: "down",
    image: down,
    position: { pan: -45.57, tilt: -27.64, zoom: 1 },
    // modified: 2026-06-01T23:12:33.957Z
  },
  downleft: {
    description: "downleft",
    image: downleft,
    position: { pan: -124.9, tilt: -21.05, zoom: 1 },
    // modified: 2026-06-11T23:50:46.235Z
  },
  downright: {
    description: "downright",
    image: downright,
    position: { pan: 61.57, tilt: -37.86, zoom: 1 },
    // modified: 2026-06-01T23:13:15.366Z
  },
  farcorner: {
    description: "farcorner",
    image: farcorner,
    position: { pan: 10.35, tilt: -2.51, zoom: 345 },
    // modified: 2026-06-01T23:05:38.586Z
  },
  feeder: {
    description: "feeder",
    image: feeder,
    position: { pan: -93.8, tilt: -3.94, zoom: 638 },
    // modified: 2026-06-11T23:42:35.199Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -118.85, tilt: -8.84, zoom: 1 },
    // modified: 2026-06-11T23:50:03.830Z
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
    position: { pan: -130.76, tilt: -4.1, zoom: 689 },
    // modified: 2026-06-01T22:53:18.254Z
  },
  leftgrove: {
    description: "leftgrove",
    image: leftgrove,
    position: { pan: -55.44, tilt: -2.43, zoom: 172 },
    // modified: 2026-06-01T23:09:34.970Z
  },
  marmgate: {
    description: "marmgate",
    image: marmgate,
    position: { pan: -86.62, tilt: -3.38, zoom: 345 },
    // modified: 2026-06-01T22:54:46.376Z
  },
  mudpit: {
    description: "mudpit",
    image: mudpit,
    position: { pan: -47.53, tilt: -9.13, zoom: 172 },
    // modified: 2026-06-11T23:44:27.665Z
  },
  right: {
    description: "right",
    image: right,
    position: { pan: 46.68, tilt: -6.68, zoom: 1 },
    // modified: 2026-06-01T23:02:46.952Z
  },
  rightcorner: {
    description: "rightcorner",
    image: rightcorner,
    position: { pan: 57.6, tilt: -4.06, zoom: 345 },
    // modified: 2026-06-01T23:04:16.585Z
  },
  rightgrove: {
    description: "rightgrove",
    image: rightgrove,
    position: { pan: 28.92, tilt: -10.3, zoom: 1 },
    // modified: 2026-06-01T23:08:25.269Z
  },
  shelter: {
    description: "shelter",
    image: shelter,
    position: { pan: -158.8, tilt: -37.41, zoom: 1 },
    // modified: 2026-06-11T23:51:46.188Z
  },
  sleep: {
    description: "sleep",
    image: sleep,
    position: { pan: -73.64, tilt: -4.01, zoom: 623 },
    // modified: 2026-06-01T23:01:03.574Z
  },
};

const emucover = {
  title: "Emu Cover",
  group: "emu",
  presets: emucoverPresets,
};

export default emucover;
