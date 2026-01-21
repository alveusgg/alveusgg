import cave from "@/assets/presets/bb/cave.png";
import down from "@/assets/presets/bb/down.png";
import downleft from "@/assets/presets/bb/downleft.png";
import home from "@/assets/presets/bb/home.png";
import leftcorner from "@/assets/presets/bb/leftcorner.png";

import type { Preset } from "../tech/cameras.types";

const bbPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -32.92, tilt: -53.88, zoom: 1 },
    // modified: 2025-10-09T11:10:29.824Z
  },
  cave: {
    description: "Cave",
    image: cave,
    position: { pan: -32.39, tilt: -46.76, zoom: 10181 },
    // modified: 2025-10-09T11:10:29.820Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -107.92, tilt: -75.75, zoom: 5000 },
    // modified: 2025-10-09T11:10:29.816Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    position: { pan: -87.7, tilt: -66.03, zoom: 2359 },
    // modified: 2025-10-09T11:10:29.820Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -83.48, tilt: -48.41, zoom: 6497 },
    // modified: 2025-10-09T11:10:29.820Z
  },
};

const bb = {
  title: "BB",
  group: "bb",
  presets: bbPresets,
};

export default bb;
