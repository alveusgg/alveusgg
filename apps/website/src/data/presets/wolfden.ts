import home from "@/assets/presets/wolfden/home.png";
import leftcorner from "@/assets/presets/wolfden/leftcorner.png";
import rightcorner from "@/assets/presets/wolfden/rightcorner.png";

import type { Preset } from "../tech/cameras.types";

const wolfdenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.380Z
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
    position: { pan: -1.02, tilt: 103.17, zoom: 6256 },
    // modified: 2026-02-15T12:29:51.104Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    position: { pan: 65.62, tilt: -3.66, zoom: 3978 },
    // modified: 2026-01-26T01:52:12.185Z
  },
};

const wolfden = {
  title: "Wolf Den",
  group: "wolf",
  presets: wolfdenPresets,
};

export default wolfden;
