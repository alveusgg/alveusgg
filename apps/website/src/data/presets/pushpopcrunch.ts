import home from "@/assets/presets/pushpopcrunch/home.png";

import type { Preset } from "../tech/cameras.types.ts";

const pushpopcrunchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
};

const pushpopcrunch = {
  title: "Pushpop Crunch",
  group: "pushpop",
  presets: pushpopcrunchPresets,
};

export default pushpopcrunch;
