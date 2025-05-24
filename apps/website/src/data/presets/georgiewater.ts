import home from "@/assets/presets/georgiewater/home.png";

import type { Preset } from "./preset";

const georgiewaterPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
};

const georgiewater = {
  title: "Georgie Water",
  presets: georgiewaterPresets,
};

export default georgiewater;
