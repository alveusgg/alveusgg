import home from "@/assets/presets/toastcrunch/home.png";
import right from "@/assets/presets/toastcrunch/right.png";

import type { Preset } from "../tech/cameras.types";

const toastcrunchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  right: {
    description: "Right",
    image: right,
  },
};

const toastcrunch = {
  title: "Toast Crunch",
  group: "toast",
  presets: toastcrunchPresets,
};

export default toastcrunch;
