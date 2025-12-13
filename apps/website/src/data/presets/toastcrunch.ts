import home from "@/assets/presets/toastcrunch/home.png";
import right from "@/assets/presets/toastcrunch/right.png";

import type { Preset } from "../tech/cameras.types";

const toastcrunchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.308Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:30.308Z
  },
};

const toastcrunch = {
  title: "Toast Crunch",
  group: "toast",
  presets: toastcrunchPresets,
};

export default toastcrunch;
