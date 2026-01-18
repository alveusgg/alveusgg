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
    position: { pan: 107.61, tilt: -22.9, zoom: 1 },
    // modified: 2025-11-07T22:27:17.457Z
  },
  behind: {
    description: "Behind",
    image: behind,
    position: { pan: -92.08, tilt: -56.33, zoom: 1 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  domel: {
    description: "Dome Left",
    image: domel,
    position: { pan: 87.41, tilt: -15.33, zoom: 689 },
    // modified: 2025-11-07T22:45:52.543Z
  },
  domelshelf: {
    description: "Dome Left Shelf",
    image: domelshelf,
    position: { pan: 103.69, tilt: -14.16, zoom: 689 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  domelt: {
    description: "Dome Left Top",
    image: domelt,
    position: { pan: 87.66, tilt: -7.94, zoom: 689 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  domer: {
    description: "Dome Right",
    image: domer,
    position: { pan: 132.58, tilt: -14.35, zoom: 1035 },
    // modified: 2025-11-07T22:46:18.752Z
  },
  domerl: {
    description: "Dome Right Left Shelf",
    image: domerl,
    position: { pan: 125.95, tilt: -13.14, zoom: 689 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  domerr: {
    description: "Dome Right Right Shelf",
    image: domerr,
    position: { pan: 142.32, tilt: -16.47, zoom: 689 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  domert: {
    description: "Dome Right Top",
    image: domert,
    position: { pan: 135.11, tilt: -7.96, zoom: 689 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    position: { pan: 15.05, tilt: -49.51, zoom: 1 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  flaps: {
    description: "Flaps",
    image: flaps,
    position: { pan: 54.21, tilt: -37.19, zoom: 172 },
    // modified: 2025-11-07T22:33:26.919Z
  },
  floor: {
    description: "Floor",
    image: floor,
    position: { pan: 117.85, tilt: -63.48, zoom: 1 },
    // modified: 2025-10-09T11:10:29.916Z
  },
  floorbranch: {
    description: "Floor Branch",
    image: floorbranch,
    position: { pan: 130.45, tilt: -37.86, zoom: 213 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  hammock: {
    description: "Hammock",
    image: hammock,
    position: { pan: 95.53, tilt: -4.6, zoom: 345 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: 52.08, tilt: -26.9, zoom: 1 },
    // modified: 2025-11-07T22:33:41.483Z
  },
  leftcornerb: {
    description: "Left Corner Bottom",
    image: leftcornerb,
    position: { pan: 79.91, tilt: -36.27, zoom: 1 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  leftcornert: {
    description: "Left Corner Top",
    image: leftcornert,
    position: { pan: 74.45, tilt: -1.24, zoom: 1 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  nearrightshelf: {
    description: "Near Right Shelf",
    image: nearrightshelf,
    position: { pan: -169.21, tilt: -26.32, zoom: 1 },
    // modified: 2025-11-30T18:54:42.538Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 155.61, tilt: -18.79, zoom: 1 },
    // modified: 2025-11-07T22:30:41.644Z
  },
  table: {
    description: "Table",
    image: table,
    position: { pan: 115.86, tilt: -31.87, zoom: 689 },
    // modified: 2025-10-09T11:10:29.916Z
  },
  win1: {
    description: "Window 1",
    image: win1,
    position: { pan: 92.77, tilt: -43.91, zoom: 1289 },
    // modified: 2025-11-07T22:28:34.226Z
  },
  win2: {
    description: "Window 2",
    image: win2,
    position: { pan: 122.76, tilt: -24.75, zoom: 786 },
    // modified: 2025-11-07T22:29:03.578Z
  },
  win3: {
    description: "Window 3",
    image: win3,
    position: { pan: 140.59, tilt: -25.3, zoom: 1010 },
    // modified: 2025-11-07T22:29:32.171Z
  },
  win4: {
    description: "Window 4",
    image: win4,
    position: { pan: 170.63, tilt: -16.55, zoom: 689 },
    // modified: 2025-11-07T22:30:09.203Z
  },
};

const marmin = {
  title: "Marmoset Indoor",
  group: "marmoset",
  presets: marminPresets,
};

export default marmin;
