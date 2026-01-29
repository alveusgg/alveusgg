import awning from "@/assets/presets/littles/awning.png";
import bowll from "@/assets/presets/littles/bowll.png";
import bowlm from "@/assets/presets/littles/bowlm.png";
import bowlr from "@/assets/presets/littles/bowlr.png";
import door from "@/assets/presets/littles/door.png";
import down from "@/assets/presets/littles/down.png";
import floorr from "@/assets/presets/littles/floorr.png";
import home from "@/assets/presets/littles/home.png";
import inside from "@/assets/presets/littles/inside.png";
import left from "@/assets/presets/littles/left.png";
import leftb from "@/assets/presets/littles/leftb.png";
import leftback from "@/assets/presets/littles/leftback.png";
import leftcorner from "@/assets/presets/littles/leftcorner.png";
import macawsinside from "@/assets/presets/littles/macawsinside.png";
import miasleep from "@/assets/presets/littles/miasleep.png";
import right from "@/assets/presets/littles/right.png";
import sirensleep from "@/assets/presets/littles/sirensleep.png";
import water from "@/assets/presets/littles/water.png";
import waterl from "@/assets/presets/littles/waterl.png";
import window from "@/assets/presets/littles/window.png";
import winl from "@/assets/presets/littles/winl.png";
import wint from "@/assets/presets/littles/wint.png";

import type { Preset } from "../tech/cameras.types";

const littlesPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 140.35, tilt: -15.2, zoom: 1 },
    // modified: 2025-10-13T22:33:28.935Z
  },
  awning: {
    description: "awning",
    image: awning,
    position: { pan: 169.92, tilt: 0, zoom: 150 },
    // modified: 2026-01-28T23:23:07.770Z
  },
  bowll: {
    description: "bowll",
    image: bowll,
    position: { pan: 128.06, tilt: -24.85, zoom: 428 },
    // modified: 2025-10-15T13:37:21.948Z
  },
  bowlm: {
    description: "bowlm",
    image: bowlm,
    position: { pan: 150.75, tilt: -12.7, zoom: 768 },
    // modified: 2025-10-15T13:35:50.222Z
  },
  bowlr: {
    description: "bowlr",
    image: bowlr,
    position: { pan: 150.96, tilt: -4.42, zoom: 1218 },
    // modified: 2025-10-15T13:34:22.097Z
  },
  door: {
    description: "door",
    image: door,
    position: { pan: 156.88, tilt: -6.47, zoom: 585 },
    // modified: 2025-12-15T21:40:40.730Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 131.91, tilt: -59.98, zoom: 1 },
    // modified: 2025-10-13T22:42:33.956Z
  },
  floorr: {
    description: "Floor Right",
    image: floorr,
    position: { pan: 157.37, tilt: -33.33, zoom: 1 },
    // modified: 2025-10-13T22:34:34.580Z
  },
  inside: {
    description: "inside",
    image: inside,
    position: { pan: 173.04, tilt: -8.16, zoom: 1900 },
    // modified: 2025-10-31T23:45:17.001Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: 172.31, tilt: -8.86, zoom: 1152 },
    // modified: 2025-10-13T20:59:44.329Z
  },
  leftb: {
    description: "Left Bottom",
    image: leftb,
    position: { pan: 119.36, tilt: -35.42, zoom: 165 },
    // modified: 2025-10-13T22:34:06.652Z
  },
  leftback: {
    description: "leftback",
    image: leftback,
    position: { pan: 118.2, tilt: -7.13, zoom: 258 },
    // modified: 2025-11-28T16:11:00.970Z
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
    position: { pan: 109.17, tilt: -6.51, zoom: 798 },
    // modified: 2025-11-28T16:10:30.034Z
  },
  macawsinside: {
    description: "macawsinside",
    image: macawsinside,
    position: { pan: 139.55, tilt: -5.83, zoom: 1678 },
    // modified: 2025-11-29T18:38:08.045Z
  },
  miasleep: {
    description: "miasleep",
    image: miasleep,
    position: { pan: 154.93, tilt: -7.45, zoom: 1784 },
    // modified: 2025-10-14T01:16:39.684Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 154.1, tilt: -12.56, zoom: 1 },
    // modified: 2025-10-13T20:59:11.661Z
  },
  sirensleep: {
    description: "sirensleep",
    image: sirensleep,
    position: { pan: -177.88, tilt: -1.6, zoom: 3261 },
    // modified: 2025-10-15T16:49:17.117Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: 139.79, tilt: -22.01, zoom: 576 },
    // modified: 2025-10-13T21:00:29.022Z
  },
  waterl: {
    description: "waterl",
    image: waterl,
    position: { pan: 129.01, tilt: -10.98, zoom: 638 },
    // modified: 2025-10-15T13:41:08.436Z
  },
  window: {
    description: "Window",
    image: window,
    position: { pan: 172.31, tilt: -8.86, zoom: 1152 },
    // modified: 2025-10-13T21:00:56.363Z
  },
  winl: {
    description: "winl",
    image: winl,
    position: { pan: 164.23, tilt: -6.2, zoom: 1905 },
    // modified: 2025-10-16T14:57:01.624Z
  },
  wint: {
    description: "wint",
    image: wint,
    position: { pan: 169.57, tilt: -4.88, zoom: 703 },
    // modified: 2026-01-04T17:33:41.110Z
  },
};

const littles = {
  title: "Littles",
  group: "parrot",
  presets: littlesPresets,
};

export default littles;
