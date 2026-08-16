import home from "@/assets/presets/nature/home.png";
import pond from "@/assets/presets/nature/pond.png";
import sunset from "@/assets/presets/nature/sunset.png";
import sunsetz from "@/assets/presets/nature/sunsetz.png";

import type { Preset } from "../tech/cameras.types";

const naturePresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: 13.52, tilt: -8.32, zoom: 1 },
    // modified: 2026-05-31T15:03:44.221Z
  },
  pond: {
    description: "pond",
    image: pond,
    position: { pan: -81.41, tilt: -10.93, zoom: 370 },
    // modified: 2026-05-31T14:59:48.021Z
  },
  sunset: {
    description: "sunset",
    image: sunset,
    position: { pan: 91.89, tilt: 8.75, zoom: 480 },
    // modified: 2026-08-15T01:29:48.179Z
  },
  sunsetz: {
    description: "sunsetz",
    image: sunsetz,
    position: { pan: 97.53, tilt: 5.87, zoom: 923 },
    // modified: 2026-08-15T01:48:32.988Z
  },
};

const nature = {
  title: "Nature",
  group: "nature",
  presets: naturePresets,
};

export default nature;
