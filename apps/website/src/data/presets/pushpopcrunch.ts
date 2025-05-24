import home from "@/assets/presets/pushpopcrunch/home.png";

import type { Preset } from "./preset";

const pushpopcrunchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
};

const pushpopcrunch = {
  title: "Pushpop Crunch",
  presets: pushpopcrunchPresets,
};

export default pushpopcrunch;
