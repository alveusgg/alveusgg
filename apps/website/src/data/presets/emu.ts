import home from "@/assets/presets/emu/home.png";

import type { Preset } from "../tech/cameras.types";

const emuPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
};

const emu = {
  title: "Emu",
  group: "emu",
  presets: emuPresets,
};

export default emu;
