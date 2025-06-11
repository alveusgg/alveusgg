import home from "@/assets/presets/chin3/home.png";

import type { Preset } from "../tech/cameras.types";

const chin3Presets: Record<string, Preset> = {
  home: {
    description: "Home, cam cannot move",
    image: home,
  },
};

const chin3 = {
  title: "Chin Lower Right",
  group: "chin",
  presets: chin3Presets,
};

export default chin3;
