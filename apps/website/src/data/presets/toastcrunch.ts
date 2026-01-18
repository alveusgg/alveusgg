import home from "@/assets/presets/toastcrunch/home.png";
import right from "@/assets/presets/toastcrunch/right.png";

import type { Preset } from "../tech/cameras.types";

const toastcrunchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.308Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 76.03, tilt: 47.33, zoom: 6336 },
    // modified: 2025-10-09T11:10:30.308Z
  },
};

const toastcrunch = {
  title: "Toast Crunch",
  group: "toast",
  presets: toastcrunchPresets,
};

export default toastcrunch;
