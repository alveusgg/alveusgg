import domell from "@/assets/presets/marmout/domell.png";
import domelu from "@/assets/presets/marmout/domelu.png";
import domelut from "@/assets/presets/marmout/domelut.png";
import domer from "@/assets/presets/marmout/domer.png";
import down from "@/assets/presets/marmout/down.png";
import downleft from "@/assets/presets/marmout/downleft.png";
import downright from "@/assets/presets/marmout/downright.png";
import farcornerb from "@/assets/presets/marmout/farcornerb.png";
import farcornert from "@/assets/presets/marmout/farcornert.png";
import flaps from "@/assets/presets/marmout/flaps.png";
import flapsb from "@/assets/presets/marmout/flapsb.png";
import ground from "@/assets/presets/marmout/ground.png";
import home from "@/assets/presets/marmout/home.png";
import left from "@/assets/presets/marmout/left.png";
import leftcornerhideb from "@/assets/presets/marmout/leftcornerhideb.png";
import lefthammock from "@/assets/presets/marmout/lefthammock.png";
import leftposttop from "@/assets/presets/marmout/leftposttop.png";
import nearleftshelf from "@/assets/presets/marmout/nearleftshelf.png";
import nearlefttop from "@/assets/presets/marmout/nearlefttop.png";
import nearrightshelves from "@/assets/presets/marmout/nearrightshelves.png";
import right from "@/assets/presets/marmout/right.png";
import rightpost from "@/assets/presets/marmout/rightpost.png";
import table from "@/assets/presets/marmout/table.png";
import tablet from "@/assets/presets/marmout/tablet.png";
import upleft from "@/assets/presets/marmout/upleft.png";
import upleftbranch from "@/assets/presets/marmout/upleftbranch.png";
import upright from "@/assets/presets/marmout/upright.png";
import uprightbranches from "@/assets/presets/marmout/uprightbranches.png";

import type { Preset } from "../tech/cameras.types";

const marmoutPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 135.7, tilt: -18.09, zoom: 1 },
    // modified: 2025-11-07T22:34:48.564Z
  },
  domell: {
    description: "Dome Left Lower",
    image: domell,
    position: { pan: 126.28, tilt: -8.91, zoom: 1718 },
    // modified: 2025-11-30T18:55:02.883Z
  },
  domelu: {
    description: "Dome Left Upper",
    image: domelu,
    position: { pan: 128.88, tilt: 0.01, zoom: 1633 },
    // modified: 2025-11-09T15:41:24.398Z
  },
  domelut: {
    description: "domelut",
    image: domelut,
    position: { pan: 128.77, tilt: 2.96, zoom: 729 },
    // modified: 2025-12-23T21:06:51.012Z
  },
  domer: {
    description: "Dome Right",
    image: domer,
    position: { pan: 150.19, tilt: -7.04, zoom: 1662 },
    // modified: 2025-11-09T15:43:20.327Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 136.2, tilt: -50.19, zoom: 1 },
    // modified: 2025-11-09T15:44:28.044Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    position: { pan: 98.98, tilt: -47.83, zoom: 1 },
    // modified: 2025-11-09T15:44:51.009Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: 164.45, tilt: -54.07, zoom: 1 },
    // modified: 2025-11-09T15:45:20.993Z
  },
  farcornerb: {
    description: "Far Corner Bottom",
    image: farcornerb,
    position: { pan: 135.35, tilt: -10.27, zoom: 332 },
    // modified: 2025-11-30T18:55:02.883Z
  },
  farcornert: {
    description: "Far Corner Top",
    image: farcornert,
    position: { pan: 136.03, tilt: 3.43, zoom: 332 },
    // modified: 2025-11-30T18:55:02.883Z
  },
  flaps: {
    description: "Flaps",
    image: flaps,
    position: { pan: 143.74, tilt: -12.15, zoom: 998 },
    // modified: 2025-12-18T21:16:12.211Z
  },
  flapsb: {
    description: "flapsb",
    image: flapsb,
    position: { pan: 145.38, tilt: -26.84, zoom: 532 },
    // modified: 2026-01-03T21:32:23.988Z
  },
  ground: {
    description: "Ground",
    image: ground,
    position: { pan: 133.79, tilt: -36.41, zoom: 1 },
    // modified: 2025-11-09T15:46:05.330Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: 104.97, tilt: -19.18, zoom: 1 },
    // modified: 2025-11-07T22:54:41.336Z
  },
  leftcornerhideb: {
    description: "Left Corner Hide Bottom",
    image: leftcornerhideb,
    position: { pan: 87.49, tilt: -16.48, zoom: 998 },
    // modified: 2025-11-09T15:49:08.621Z
  },
  lefthammock: {
    description: "lefthammock",
    image: lefthammock,
    position: { pan: 116.1, tilt: -18.9, zoom: 415 },
    // modified: 2026-01-04T17:27:14.612Z
  },
  leftposttop: {
    description: "Left Post Top",
    image: leftposttop,
    position: { pan: 109.56, tilt: -9.46, zoom: 664 },
    // modified: 2025-11-07T22:47:32.733Z
  },
  nearleftshelf: {
    description: "Near Left Shelf",
    image: nearleftshelf,
    position: { pan: 84.63, tilt: -0.52, zoom: 332 },
    // modified: 2025-11-09T15:52:13.676Z
  },
  nearlefttop: {
    description: "Near Left Top",
    image: nearlefttop,
    position: { pan: 84.43, tilt: 20, zoom: 332 },
    // modified: 2025-11-09T15:51:20.327Z
  },
  nearrightshelves: {
    description: "Near Right Shelves",
    image: nearrightshelves,
    position: { pan: 178.45, tilt: -10.16, zoom: 332 },
    // modified: 2025-11-09T15:53:31.525Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 159.36, tilt: -17.56, zoom: 1 },
    // modified: 2025-11-07T22:53:17.546Z
  },
  rightpost: {
    description: "rightpost",
    image: rightpost,
    position: { pan: 150.45, tilt: -17.82, zoom: 748 },
    // modified: 2025-12-27T13:43:27.137Z
  },
  table: {
    description: "Table",
    image: table,
    position: { pan: 136.27, tilt: -21.57, zoom: 665 },
    // modified: 2025-12-18T21:17:08.440Z
  },
  tablet: {
    description: "Tablet",
    image: tablet,
    position: { pan: 164.94, tilt: -1.91, zoom: 1537 },
    // modified: 2025-11-07T22:38:33.372Z
  },
  upleft: {
    description: "Up Left",
    image: upleft,
    position: { pan: 109.23, tilt: 5.68, zoom: 1 },
    // modified: 2025-12-18T21:20:14.519Z
  },
  upleftbranch: {
    description: "upleftbranch",
    image: upleftbranch,
    position: { pan: 121.06, tilt: 4.68, zoom: 1 },
    // modified: 2026-01-03T21:37:25.125Z
  },
  upright: {
    description: "Up Right",
    image: upright,
    position: { pan: 154, tilt: 9.72, zoom: 1 },
    // modified: 2025-11-07T22:55:24.472Z
  },
  uprightbranches: {
    description: "uprightbranches",
    image: uprightbranches,
    position: { pan: 153.83, tilt: 0.82, zoom: 174 },
    // modified: 2026-01-04T17:30:27.751Z
  },
};

const marmout = {
  title: "Marmoset Outdoor",
  group: "marmoset",
  presets: marmoutPresets,
};

export default marmout;
