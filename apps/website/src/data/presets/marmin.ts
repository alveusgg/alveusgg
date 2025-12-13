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
    // modified: 2025-11-07T22:27:17.457Z
  },
  behind: {
    description: "Behind",
    image: behind,
    // modified: 2025-11-30T18:54:42.538Z
  },
  domel: {
    description: "Dome Left",
    image: domel,
    // modified: 2025-11-07T22:45:52.543Z
  },
  domelshelf: {
    description: "Dome Left Shelf",
    image: domelshelf,
    // modified: 2025-11-30T18:54:42.538Z
  },
  domelt: {
    description: "Dome Left Top",
    image: domelt,
    // modified: 2025-11-30T18:54:42.538Z
  },
  domer: {
    description: "Dome Right",
    image: domer,
    // modified: 2025-11-07T22:46:18.752Z
  },
  domerl: {
    description: "Dome Right Left Shelf",
    image: domerl,
    // modified: 2025-11-30T18:54:42.538Z
  },
  domerr: {
    description: "Dome Right Right Shelf",
    image: domerr,
    // modified: 2025-11-30T18:54:42.538Z
  },
  domert: {
    description: "Dome Right Top",
    image: domert,
    // modified: 2025-11-30T18:54:42.538Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    // modified: 2025-11-30T18:54:42.538Z
  },
  flaps: {
    description: "Flaps",
    image: flaps,
    // modified: 2025-11-07T22:33:26.919Z
  },
  floor: {
    description: "Floor",
    image: floor,
    // modified: 2025-10-09T11:10:29.916Z
  },
  floorbranch: {
    description: "Floor Branch",
    image: floorbranch,
    // modified: 2025-11-30T18:54:42.538Z
  },
  hammock: {
    description: "Hammock",
    image: hammock,
    // modified: 2025-11-30T18:54:42.538Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-11-07T22:33:41.483Z
  },
  leftcornerb: {
    description: "Left Corner Bottom",
    image: leftcornerb,
    // modified: 2025-11-30T18:54:42.538Z
  },
  leftcornert: {
    description: "Left Corner Top",
    image: leftcornert,
    // modified: 2025-11-30T18:54:42.538Z
  },
  nearrightshelf: {
    description: "Near Right Shelf",
    image: nearrightshelf,
    // modified: 2025-11-30T18:54:42.538Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-11-07T22:30:41.644Z
  },
  table: {
    description: "Table",
    image: table,
    // modified: 2025-10-09T11:10:29.916Z
  },
  win1: {
    description: "Window 1",
    image: win1,
    // modified: 2025-11-07T22:28:34.226Z
  },
  win2: {
    description: "Window 2",
    image: win2,
    // modified: 2025-11-07T22:29:03.578Z
  },
  win3: {
    description: "Window 3",
    image: win3,
    // modified: 2025-11-07T22:29:32.171Z
  },
  win4: {
    description: "Window 4",
    image: win4,
    // modified: 2025-11-07T22:30:09.203Z
  },
};

const marmin = {
  title: "Marmoset Indoor",
  group: "marmoset",
  presets: marminPresets,
};

export default marmin;
