import down from "@/assets/presets/marty/down.png";
import downright from "@/assets/presets/marty/downright.png";
import home from "@/assets/presets/marty/home.png";
import right from "@/assets/presets/marty/right.png";

import type { Preset } from "../tech/cameras.types";

const martyPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:29.964Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:29.964Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    // modified: 2025-10-09T11:10:29.964Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:29.964Z
  },
};

const marty = {
  title: "Marty",
  group: "marty",
  presets: martyPresets,
};

export default marty;
