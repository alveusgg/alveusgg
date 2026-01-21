import home from "@/assets/presets/pushpopcrunch/home.png";

import type { Preset } from "../tech/cameras.types";

const pushpopcrunchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.452Z
  },
};

const pushpopcrunch = {
  title: "Pushpop Crunch",
  group: "pushpop",
  presets: pushpopcrunchPresets,
};

export default pushpopcrunch;
