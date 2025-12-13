import home from "@/assets/presets/wolfden/home.png";
import rightcorner from "@/assets/presets/wolfden/rightcorner.png";

import type { Preset } from "../tech/cameras.types";

const wolfdenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.380Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    // modified: 2025-10-09T11:10:30.380Z
  },
};

const wolfden = {
  title: "Wolf Den",
  group: "wolf",
  presets: wolfdenPresets,
};

export default wolfden;
