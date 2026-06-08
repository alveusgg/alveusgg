import home from "@/assets/presets/emupond/home.png";

import type { Preset } from "../tech/cameras.types";

const emupondPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2026-06-01T23:14:30.315Z
  },
};

const emupond = {
  title: "Emu Pond",
  group: "emu",
  presets: emupondPresets,
};

export default emupond;
