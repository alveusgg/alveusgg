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
    // modified: 2025-10-09T11:10:29.824Z
  },
  cave: {
    description: "Cave",
    image: cave,
    // modified: 2025-10-09T11:10:29.820Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:29.816Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    // modified: 2025-10-09T11:10:29.820Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    // modified: 2025-10-09T11:10:29.820Z
  },
};

const bb = {
  title: "BB",
  group: "bb",
  presets: bbPresets,
};

export default bb;
