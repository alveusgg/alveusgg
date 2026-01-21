import home from "@/assets/presets/wolfden/home.png";
import rightcorner from "@/assets/presets/wolfden/rightcorner.png";

import type { Preset } from "../tech/cameras.types";

const wolfdenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.380Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    position: { pan: 0, tilt: -9.83, zoom: 3001 },
    // modified: 2025-10-09T11:10:30.380Z
  },
};

const wolfden = {
  title: "Wolf Den",
  group: "wolf",
  presets: wolfdenPresets,
};

export default wolfden;
