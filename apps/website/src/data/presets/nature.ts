import home from "@/assets/presets/nature/home.png";
import pond from "@/assets/presets/nature/pond.png";

import type { Preset } from "../tech/cameras.types";

const naturePresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: 13.52, tilt: -8.32, zoom: 1 },
    // modified: 2026-05-31T15:03:44.221Z
  },
  pond: {
    description: "pond",
    image: pond,
    position: { pan: -81.41, tilt: -10.93, zoom: 370 },
    // modified: 2026-05-31T14:59:48.021Z
  },
};

const nature = {
  title: "Nature",
  group: "nature",
  presets: naturePresets,
};

export default nature;
