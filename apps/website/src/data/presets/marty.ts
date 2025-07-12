import down from "@/assets/presets/marty/down.png";
import downright from "@/assets/presets/marty/downright.png";
import home from "@/assets/presets/marty/home.png";
import right from "@/assets/presets/marty/right.png";

import type { Preset } from "../tech/cameras.types";

const martyPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  down: {
    description: "Down",
    image: down,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  right: {
    description: "Right",
    image: right,
  },
};

const marty = {
  title: "Marty",
  group: "marty",
  presets: martyPresets,
};

export default marty;
