import cave from "@/assets/presets/patchy/cave.png";
import closebranches from "@/assets/presets/patchy/closebranches.png";
import down from "@/assets/presets/patchy/down.png";
import farbranches from "@/assets/presets/patchy/farbranches.png";
import groundm from "@/assets/presets/patchy/groundm.png";
import home from "@/assets/presets/patchy/home.png";
import log from "@/assets/presets/patchy/log.png";
import rightcorner from "@/assets/presets/patchy/rightcorner.png";
import water from "@/assets/presets/patchy/water.png";

import type { Preset } from "../tech/cameras.types";

const patchyPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  cave: {
    description: "Cave",
    image: cave,
  },
  closebranches: {
    description: "Close Branches",
    image: closebranches,
  },
  down: {
    description: "Down",
    image: down,
  },
  farbranches: {
    description: "Far Branches",
    image: farbranches,
  },
  groundm: {
    description: "Ground Middle",
    image: groundm,
  },
  log: {
    description: "Log",
    image: log,
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const patchy = {
  title: "Patchy",
  group: "patchy",
  presets: patchyPresets,
};

export default patchy;
