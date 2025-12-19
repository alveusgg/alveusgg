import domell from "@/assets/presets/marmout/domell.png";
import domelu from "@/assets/presets/marmout/domelu.png";
import domer from "@/assets/presets/marmout/domer.png";
import down from "@/assets/presets/marmout/down.png";
import downleft from "@/assets/presets/marmout/downleft.png";
import downright from "@/assets/presets/marmout/downright.png";
import farcornerb from "@/assets/presets/marmout/farcornerb.png";
import farcornert from "@/assets/presets/marmout/farcornert.png";
import flaps from "@/assets/presets/marmout/flaps.png";
import ground from "@/assets/presets/marmout/ground.png";
import home from "@/assets/presets/marmout/home.png";
import left from "@/assets/presets/marmout/left.png";
import leftcornerhideb from "@/assets/presets/marmout/leftcornerhideb.png";
import leftposttop from "@/assets/presets/marmout/leftposttop.png";
import nearleftshelf from "@/assets/presets/marmout/nearleftshelf.png";
import nearlefttop from "@/assets/presets/marmout/nearlefttop.png";
import nearrightshelves from "@/assets/presets/marmout/nearrightshelves.png";
import right from "@/assets/presets/marmout/right.png";
import table from "@/assets/presets/marmout/table.png";
import tablet from "@/assets/presets/marmout/tablet.png";
import upleft from "@/assets/presets/marmout/upleft.png";
import upright from "@/assets/presets/marmout/upright.png";

import type { Preset } from "../tech/cameras.types";

const marmoutPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-11-07T22:34:48.564Z
  },
  domell: {
    description: "Dome Left Lower",
    image: domell,
    // modified: 2025-11-30T18:55:02.883Z
  },
  domelu: {
    description: "Dome Left Upper",
    image: domelu,
    // modified: 2025-11-09T15:41:24.398Z
  },
  domer: {
    description: "Dome Right",
    image: domer,
    // modified: 2025-11-09T15:43:20.327Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-11-09T15:44:28.044Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    // modified: 2025-11-09T15:44:51.009Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    // modified: 2025-11-09T15:45:20.993Z
  },
  farcornerb: {
    description: "Far Corner Bottom",
    image: farcornerb,
    // modified: 2025-11-30T18:55:02.883Z
  },
  farcornert: {
    description: "Far Corner Top",
    image: farcornert,
    // modified: 2025-11-30T18:55:02.883Z
  },
  flaps: {
    description: "Flaps",
    image: flaps,
    // modified: 2025-12-18T21:16:12.211Z
  },
  ground: {
    description: "Ground",
    image: ground,
    // modified: 2025-11-09T15:46:05.330Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-11-07T22:54:41.336Z
  },
  leftcornerhideb: {
    description: "Left Corner Hide Bottom",
    image: leftcornerhideb,
    // modified: 2025-11-09T15:49:08.621Z
  },
  leftposttop: {
    description: "Left Post Top",
    image: leftposttop,
    // modified: 2025-11-07T22:47:32.733Z
  },
  nearleftshelf: {
    description: "Near Left Shelf",
    image: nearleftshelf,
    // modified: 2025-11-09T15:52:13.676Z
  },
  nearlefttop: {
    description: "Near Left Top",
    image: nearlefttop,
    // modified: 2025-11-09T15:51:20.327Z
  },
  nearrightshelves: {
    description: "Near Right Shelves",
    image: nearrightshelves,
    // modified: 2025-11-09T15:53:31.525Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-11-07T22:53:17.546Z
  },
  table: {
    description: "Table",
    image: table,
    // modified: 2025-12-18T21:17:08.440Z
  },
  tablet: {
    description: "Tablet",
    image: tablet,
    // modified: 2025-11-07T22:38:33.372Z
  },
  upleft: {
    description: "Up Left",
    image: upleft,
    // modified: 2025-12-18T21:20:14.519Z
  },
  upright: {
    description: "Up Right",
    image: upright,
    // modified: 2025-11-07T22:55:24.472Z
  },
};

const marmout = {
  title: "Marmoset Outdoor",
  group: "marmoset",
  presets: marmoutPresets,
};

export default marmout;
