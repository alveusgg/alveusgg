import behind from "@/assets/presets/marmin/behind.png";
import domel from "@/assets/presets/marmin/domel.png";
import domelshelf from "@/assets/presets/marmin/domelshelf.png";
import domelt from "@/assets/presets/marmin/domelt.png";
import domer from "@/assets/presets/marmin/domer.png";
import domerl from "@/assets/presets/marmin/domerl.png";
import domerr from "@/assets/presets/marmin/domerr.png";
import domert from "@/assets/presets/marmin/domert.png";
import downleft from "@/assets/presets/marmin/downleft.png";
import flaps from "@/assets/presets/marmin/flaps.png";
import floor from "@/assets/presets/marmin/floor.png";
import floorbranch from "@/assets/presets/marmin/floorbranch.png";
import hammock from "@/assets/presets/marmin/hammock.png";
import home from "@/assets/presets/marmin/home.png";
import left from "@/assets/presets/marmin/left.png";
import leftcornerb from "@/assets/presets/marmin/leftcornerb.png";
import leftcornert from "@/assets/presets/marmin/leftcornert.png";
import nearrightshelf from "@/assets/presets/marmin/nearrightshelf.png";
import right from "@/assets/presets/marmin/right.png";
import table from "@/assets/presets/marmin/table.png";
import win1 from "@/assets/presets/marmin/win1.png";
import win2 from "@/assets/presets/marmin/win2.png";
import win3 from "@/assets/presets/marmin/win3.png";
import win4 from "@/assets/presets/marmin/win4.png";

import type { Preset } from "../tech/cameras.types";

const marminPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  behind: {
    description: "Behind",
    image: behind,
  },
  domel: {
    description: "Dome Left",
    image: domel,
  },
  domelshelf: {
    description: "Dome Left Shelf",
    image: domelshelf,
  },
  domelt: {
    description: "Dome Left Top",
    image: domelt,
  },
  domer: {
    description: "Dome Right",
    image: domer,
  },
  domerl: {
    description: "Dome Right Left Shelf",
    image: domerl,
  },
  domerr: {
    description: "Dome Right Right Shelf",
    image: domerr,
  },
  domert: {
    description: "Dome Right Top",
    image: domert,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  flaps: {
    description: "Flaps",
    image: flaps,
  },
  floor: {
    description: "Floor",
    image: floor,
  },
  floorbranch: {
    description: "Floor Branch",
    image: floorbranch,
  },
  hammock: {
    description: "Hammock",
    image: hammock,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftcornerb: {
    description: "Left Corner Bottom",
    image: leftcornerb,
  },
  leftcornert: {
    description: "Left Corner Top",
    image: leftcornert,
  },
  nearrightshelf: {
    description: "Near Right Shelf",
    image: nearrightshelf,
  },
  right: {
    description: "Right",
    image: right,
  },
  table: {
    description: "Table",
    image: table,
  },
  win1: {
    description: "Window 1",
    image: win1,
  },
  win2: {
    description: "Window 2",
    image: win2,
  },
  win3: {
    description: "Window 3",
    image: win3,
  },
  win4: {
    description: "Window 4",
    image: win4,
  },
};

const marmin = {
  title: "Marmoset Indoor",
  group: "marmoset",
  presets: marminPresets,
};

export default marmin;
