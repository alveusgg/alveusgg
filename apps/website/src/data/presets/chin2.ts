import home from "@/assets/presets/chin2/home.png";

import type { Preset } from "../tech/cameras.types";

const chin2Presets: Record<string, Preset> = {
  home: {
    description: "Home, cam cannot move",
    image: home,
  },
};

const chin2 = {
  title: "Chin Lower Left",
  group: "chin",
  presets: chin2Presets,
};

export default chin2;
