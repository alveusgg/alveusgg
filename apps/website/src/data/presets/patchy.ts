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
    // modified: 2025-10-09T11:10:30.368Z
  },
  cave: {
    description: "Cave",
    image: cave,
    // modified: 2025-10-09T11:10:30.368Z
  },
  closebranches: {
    description: "Close Branches",
    image: closebranches,
    // modified: 2025-10-09T11:10:30.368Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.372Z
  },
  farbranches: {
    description: "Far Branches",
    image: farbranches,
    // modified: 2025-10-09T11:10:30.368Z
  },
  groundm: {
    description: "Ground Middle",
    image: groundm,
    // modified: 2025-10-09T11:10:30.372Z
  },
  log: {
    description: "Log",
    image: log,
    // modified: 2025-10-09T11:10:30.368Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    // modified: 2025-10-09T11:10:30.368Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:30.372Z
  },
};

const patchy = {
  title: "Patchy",
  group: "patchy",
  presets: patchyPresets,
};

export default patchy;
