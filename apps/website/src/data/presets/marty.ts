import down from "@/assets/presets/marty/down.png";
import downright from "@/assets/presets/marty/downright.png";
import home from "@/assets/presets/marty/home.png";
import right from "@/assets/presets/marty/right.png";

import type { Preset } from "../tech/cameras.types";

const martyPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -56.5, tilt: -28.12, zoom: 1 },
    // modified: 2025-10-09T11:10:29.964Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 0.5, tilt: -63.14, zoom: 1 },
    // modified: 2025-10-09T11:10:29.964Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: 9.35, tilt: -68.51, zoom: 8748 },
    // modified: 2025-10-09T11:10:29.964Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -35.33, tilt: -22.64, zoom: 1 },
    // modified: 2025-10-09T11:10:29.964Z
  },
};

const marty = {
  title: "Marty",
  group: "marty",
  presets: martyPresets,
};

export default marty;
