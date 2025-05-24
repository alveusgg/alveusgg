import { type StaticImageData } from "next/image";

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

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const crowinPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  back: {
    description: "Back",
    image: back,
  },
  backcorner: {
    description: "Back Corner",
    image: backcorner,
  },
  backcornerr: {
    description: "Back Corner Right",
    image: backcornerr,
  },
  backleftcorner: {
    description: "Back Left Corner",
    image: backleftcorner,
  },
  crowsleep: {
    description: "Crow Sleep",
    image: crowsleep,
  },
  down: {
    description: "Down",
    image: down,
  },
  down2: {
    description: "Down 2",
    image: down2,
  },
  entry: {
    description: "Entry",
    image: entry,
  },
  heater: {
    description: "Heater",
    image: heater,
  },
  hose: {
    description: "Hose",
    image: hose,
  },
  outside: {
    description: "Outside",
    image: outside,
  },
  platform: {
    description: "Platform",
    image: platform,
  },
  rightperch: {
    description: "Right Perch",
    image: rightperch,
  },
  table: {
    description: "Table (old)",
    image: table,
  },
  top: {
    description: "Top",
    image: top,
  },
  training: {
    description: "Training",
    image: training,
  },
  water: {
    description: "Water",
    image: water,
  },
  window: {
    description: "Window",
    image: window,
  },
  windowc: {
    description: "Window Close",
    image: windowc,
  },
};

const crowin = {
  title: "Crow Indoor",
  presets: crowinPresets,
};

export default crowin;
