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
    // modified: 2025-10-09T11:10:29.828Z
  },
  back: {
    description: "Back",
    image: back,
    // modified: 2025-10-09T11:10:29.824Z
  },
  backcorner: {
    description: "Back Corner",
    image: backcorner,
    // modified: 2025-10-09T11:10:29.824Z
  },
  backcornerr: {
    description: "Back Corner Right",
    image: backcornerr,
    // modified: 2025-10-09T11:10:29.824Z
  },
  backleftcorner: {
    description: "Back Left Corner",
    image: backleftcorner,
    // modified: 2025-10-09T11:10:29.824Z
  },
  crowsleep: {
    description: "Crow Sleep",
    image: crowsleep,
    // modified: 2025-10-09T11:10:29.828Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:29.828Z
  },
  down2: {
    description: "Down 2",
    image: down2,
    // modified: 2025-10-09T11:10:29.828Z
  },
  entry: {
    description: "Entry",
    image: entry,
    // modified: 2025-10-09T11:10:29.828Z
  },
  heater: {
    description: "Heater",
    image: heater,
    // modified: 2025-10-09T11:10:29.828Z
  },
  hose: {
    description: "Hose",
    image: hose,
    // modified: 2025-10-09T11:10:29.828Z
  },
  outside: {
    description: "Outside",
    image: outside,
    // modified: 2025-10-09T11:10:29.828Z
  },
  platform: {
    description: "Platform",
    image: platform,
    // modified: 2025-10-09T11:10:29.828Z
  },
  rightperch: {
    description: "Right Perch",
    image: rightperch,
    // modified: 2025-10-09T11:10:29.828Z
  },
  table: {
    description: "Table (old)",
    image: table,
    // modified: 2025-10-09T11:10:29.828Z
  },
  top: {
    description: "Top",
    image: top,
    // modified: 2025-10-09T11:10:29.828Z
  },
  training: {
    description: "Training",
    image: training,
    // modified: 2025-10-09T11:10:29.832Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:29.832Z
  },
  window: {
    description: "Window",
    image: window,
    // modified: 2025-10-09T11:10:29.832Z
  },
  windowc: {
    description: "Window Close",
    image: windowc,
    // modified: 2025-10-09T11:10:29.832Z
  },
};

const crowin = {
  title: "Crow Indoor",
  group: "crow",
  presets: crowinPresets,
};

export default crowin;
