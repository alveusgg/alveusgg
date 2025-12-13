import home from "@/assets/presets/georgiewater/home.png";

import type { Preset } from "../tech/cameras.types";

const georgiewaterPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.452Z
  },
};

const georgiewater = {
  title: "Georgie Water",
  group: "georgie",
  presets: georgiewaterPresets,
};

export default georgiewater;
