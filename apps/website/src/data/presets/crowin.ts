import back from "@/assets/presets/crowin/back.png";
import backcorner from "@/assets/presets/crowin/backcorner.png";
import backcornerr from "@/assets/presets/crowin/backcornerr.png";
import backleftcorner from "@/assets/presets/crowin/backleftcorner.png";
import crowsleep from "@/assets/presets/crowin/crowsleep.png";
import down2 from "@/assets/presets/crowin/down2.png";
import down from "@/assets/presets/crowin/down.png";
import entry from "@/assets/presets/crowin/entry.png";
import heater from "@/assets/presets/crowin/heater.png";
import home from "@/assets/presets/crowin/home.png";
import hose from "@/assets/presets/crowin/hose.png";
import outside from "@/assets/presets/crowin/outside.png";
import platform from "@/assets/presets/crowin/platform.png";
import rightperch from "@/assets/presets/crowin/rightperch.png";
import table from "@/assets/presets/crowin/table.png";
import top from "@/assets/presets/crowin/top.png";
import training from "@/assets/presets/crowin/training.png";
import water from "@/assets/presets/crowin/water.png";
import window from "@/assets/presets/crowin/window.png";
import windowc from "@/assets/presets/crowin/windowc.png";

import type { Preset } from "../tech/cameras.types";

const crowinPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 70.44, tilt: -59.34, zoom: 1 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  back: {
    description: "Back",
    image: back,
    position: { pan: 46.34, tilt: -45, zoom: 301 },
    // modified: 2025-10-09T11:10:29.824Z
  },
  backcorner: {
    description: "Back Corner",
    image: backcorner,
    position: { pan: 45.77, tilt: 0, zoom: 2699 },
    // modified: 2025-10-09T11:10:29.824Z
  },
  backcornerr: {
    description: "Back Corner Right",
    image: backcornerr,
    position: { pan: 51.02, tilt: 0, zoom: 5195 },
    // modified: 2025-10-09T11:10:29.824Z
  },
  backleftcorner: {
    description: "Back Left Corner",
    image: backleftcorner,
    position: { pan: 30.38, tilt: -21.69, zoom: 4890 },
    // modified: 2025-10-09T11:10:29.824Z
  },
  crowsleep: {
    description: "Crow Sleep",
    image: crowsleep,
    position: { pan: 42.12, tilt: 0, zoom: 3698 },
    // modified: 2025-12-18T21:14:27.261Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 71.34, tilt: -75.89, zoom: 1 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  down2: {
    description: "Down 2",
    image: down2,
    position: { pan: 71.34, tilt: -84.95, zoom: 1 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  entry: {
    description: "Entry",
    image: entry,
    position: { pan: 136.31, tilt: -75.06, zoom: 1488 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  heater: {
    description: "Heater",
    image: heater,
    position: { pan: 38.27, tilt: 0, zoom: 3698 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  hose: {
    description: "Hose",
    image: hose,
    position: { pan: 62.34, tilt: -90, zoom: 1500 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  outside: {
    description: "Outside",
    image: outside,
    position: { pan: 95.83, tilt: -46.5, zoom: 1 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  platform: {
    description: "Platform",
    image: platform,
    position: { pan: 45.13, tilt: -35.96, zoom: 2290 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  rightperch: {
    description: "Right Perch",
    image: rightperch,
    position: { pan: 113.27, tilt: -10.09, zoom: 1 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  table: {
    description: "Table (old)",
    image: table,
    position: { pan: 37.77, tilt: -52, zoom: 2001 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  top: {
    description: "Top",
    image: top,
    position: { pan: 48.19, tilt: -13.71, zoom: 1 },
    // modified: 2025-10-09T11:10:29.828Z
  },
  training: {
    description: "Training",
    image: training,
    position: { pan: 46.34, tilt: -35, zoom: 301 },
    // modified: 2025-10-09T11:10:29.832Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: 80.68, tilt: -54.48, zoom: 3700 },
    // modified: 2025-10-09T11:10:29.832Z
  },
  window: {
    description: "Window",
    image: window,
    position: { pan: 99.34, tilt: -5.19, zoom: 500 },
    // modified: 2025-10-09T11:10:29.832Z
  },
  windowc: {
    description: "Window Close",
    image: windowc,
    position: { pan: 96.29, tilt: -8.44, zoom: 1500 },
    // modified: 2025-10-09T11:10:29.832Z
  },
};

const crowin = {
  title: "Crow Indoor",
  group: "crow",
  presets: crowinPresets,
};

export default crowin;
