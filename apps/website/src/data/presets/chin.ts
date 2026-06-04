import home from "@/assets/presets/chin/home.png";

import type { Preset } from "../tech/cameras.types";

const chinPresets: Record<string, Preset> = {
  home: {
    description: "Home, cam cannot move",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 0 },
    // modified: 2026-05-31T16:13:43.852Z
  },
};

const chin = {
  title: "Chin Top",
  group: "chin",
  presets: chinPresets,
};

export default chin;
