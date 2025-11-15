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
  },
  domell: {
    description: "Dome Left Lower",
    image: domell,
  },
  domelu: {
    description: "Dome Left Upper",
    image: domelu,
  },
  domer: {
    description: "Dome Right",
    image: domer,
  },
  down: {
    description: "Down",
    image: down,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  farcornerb: {
    description: "Far Corner Bottom",
    image: farcornerb,
  },
  farcornert: {
    description: "Far Corner Top",
    image: farcornert,
  },
  flaps: {
    description: "Flaps",
    image: flaps,
  },
  ground: {
    description: "Ground",
    image: ground,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftcornerhideb: {
    description: "Left Corner Hide Bottom",
    image: leftcornerhideb,
  },
  leftposttop: {
    description: "Left Post Top",
    image: leftposttop,
  },
  nearleftshelf: {
    description: "Near Left Shelf",
    image: nearleftshelf,
  },
  nearlefttop: {
    description: "Near Left Top",
    image: nearlefttop,
  },
  nearrightshelves: {
    description: "Near Right Shelves",
    image: nearrightshelves,
  },
  right: {
    description: "Right",
    image: right,
  },
  table: {
    description: "Table",
    image: table,
  },
  tablet: {
    description: "Tablet",
    image: tablet,
  },
  upleft: {
    description: "Up Left",
    image: upleft,
  },
  upright: {
    description: "Up Right",
    image: upright,
  },
};

const marmout = {
  title: "Marmoset Outdoor",
  group: "marmoset",
  presets: marmoutPresets,
};

export default marmout;
