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
    position: { pan: -24.52, tilt: -29.58, zoom: 1 },
    // modified: 2025-10-09T11:10:30.368Z
  },
  cave: {
    description: "Cave",
    image: cave,
    position: { pan: 29.48, tilt: -60.41, zoom: 5171 },
    // modified: 2025-10-09T11:10:30.368Z
  },
  closebranches: {
    description: "Close Branches",
    image: closebranches,
    position: { pan: 17.97, tilt: -38.88, zoom: 1 },
    // modified: 2025-10-09T11:10:30.368Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 9.32, tilt: -77.39, zoom: 1 },
    // modified: 2025-10-09T11:10:30.372Z
  },
  farbranches: {
    description: "Far Branches",
    image: farbranches,
    position: { pan: -42.66, tilt: -10.53, zoom: 2000 },
    // modified: 2025-10-09T11:10:30.368Z
  },
  groundm: {
    description: "Ground Middle",
    image: groundm,
    position: { pan: -36.71, tilt: -45.41, zoom: 2000 },
    // modified: 2025-10-09T11:10:30.372Z
  },
  log: {
    description: "Log",
    image: log,
    position: { pan: -24.51, tilt: -70.91, zoom: 2000 },
    // modified: 2025-10-09T11:10:30.368Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    position: { pan: 25.77, tilt: -59.21, zoom: 2104 },
    // modified: 2025-10-09T11:10:30.368Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -41.39, tilt: -30.6, zoom: 3001 },
    // modified: 2025-10-09T11:10:30.372Z
  },
};

const patchy = {
  title: "Patchy",
  group: "patchy",
  presets: patchyPresets,
};

export default patchy;
