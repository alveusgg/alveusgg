import home from "@/assets/presets/chin/home.png";

import type { Preset } from "../tech/cameras.types";

const chinPresets: Record<string, Preset> = {
  home: {
    description: "Home, cam cannot move",
    image: home,
  },
};

const chin = {
  title: "Chin Top",
  group: "chin",
  presets: chinPresets,
};

export default chin;
