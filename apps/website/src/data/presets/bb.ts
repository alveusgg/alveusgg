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
  },
  cave: {
    description: "Cave",
    image: cave,
  },
  down: {
    description: "Down",
    image: down,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
};

const bb = {
  title: "BB",
  group: "bb",
  presets: bbPresets,
};

export default bb;
