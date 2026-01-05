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
    // modified: 2025-10-13T22:33:28.935Z
  },
  awning: {
    description: "awning",
    image: awning,
    // modified: 2025-10-17T21:48:32.647Z
  },
  bowll: {
    description: "bowll",
    image: bowll,
    // modified: 2025-10-15T13:37:21.948Z
  },
  bowlm: {
    description: "bowlm",
    image: bowlm,
    // modified: 2025-10-15T13:35:50.222Z
  },
  bowlr: {
    description: "bowlr",
    image: bowlr,
    // modified: 2025-10-15T13:34:22.097Z
  },
  door: {
    description: "door",
    image: door,
    // modified: 2025-12-15T21:40:40.730Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-13T22:42:33.956Z
  },
  floorr: {
    description: "Floor Right",
    image: floorr,
    // modified: 2025-10-13T22:34:34.580Z
  },
  inside: {
    description: "inside",
    image: inside,
    // modified: 2025-10-31T23:45:17.001Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-13T20:59:44.329Z
  },
  leftb: {
    description: "Left Bottom",
    image: leftb,
    // modified: 2025-10-13T22:34:06.652Z
  },
  leftback: {
    description: "leftback",
    image: leftback,
    // modified: 2025-11-28T16:11:00.970Z
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
    // modified: 2025-11-28T16:10:30.034Z
  },
  macawsinside: {
    description: "macawsinside",
    image: macawsinside,
    // modified: 2025-11-29T18:38:08.045Z
  },
  miasleep: {
    description: "miasleep",
    image: miasleep,
    // modified: 2025-10-14T01:16:39.684Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-13T20:59:11.661Z
  },
  sirensleep: {
    description: "sirensleep",
    image: sirensleep,
    // modified: 2025-10-15T16:49:17.117Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-13T21:00:29.022Z
  },
  waterl: {
    description: "waterl",
    image: waterl,
    // modified: 2025-10-15T13:41:08.436Z
  },
  window: {
    description: "Window",
    image: window,
    // modified: 2025-10-13T21:00:56.363Z
  },
  winl: {
    description: "winl",
    image: winl,
    // modified: 2025-10-16T14:57:01.624Z
  },
  wint: {
    description: "wint",
    image: wint,
    // modified: 2026-01-04T17:33:41.110Z
  },
};

const littles = {
  title: "Littles",
  group: "parrot",
  presets: littlesPresets,
};

export default littles;
