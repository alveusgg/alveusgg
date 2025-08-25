import home from "@/assets/presets/georgiewater/home.png";

import type { Preset } from "../tech/cameras.types";

const georgiewaterPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
};

const georgiewater = {
  title: "Georgie Water",
  group: "georgie",
  presets: georgiewaterPresets,
};

export default georgiewater;
