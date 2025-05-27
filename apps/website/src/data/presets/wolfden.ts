import home from "@/assets/presets/wolfden/home.png";
import rightcorner from "@/assets/presets/wolfden/rightcorner.png";

import type { Preset } from "./preset";

const wolfdenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
  },
};

const wolfden = {
  title: "Wolf Den",
  group: "wolf",
  presets: wolfdenPresets,
};

export default wolfden;
