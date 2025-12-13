import bowl from "@/assets/presets/foxcorner/bowl.png";
import den from "@/assets/presets/foxcorner/den.png";
import hillleft from "@/assets/presets/foxcorner/hillleft.png";
import hillright from "@/assets/presets/foxcorner/hillright.png";
import hillwide from "@/assets/presets/foxcorner/hillwide.png";
import home from "@/assets/presets/foxcorner/home.png";
import insidedoor from "@/assets/presets/foxcorner/insidedoor.png";
import table from "@/assets/presets/foxcorner/table.png";
import training2 from "@/assets/presets/foxcorner/training2.png";
import training from "@/assets/presets/foxcorner/training.png";

import type { Preset } from "../tech/cameras.types";

const foxcornerPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:29.888Z
  },
  bowl: {
    description: "Bowl",
    image: bowl,
    // modified: 2025-10-09T11:10:29.888Z
  },
  den: {
    description: "Den",
    image: den,
    // modified: 2025-10-09T11:10:29.888Z
  },
  hillleft: {
    description: "Hill Left",
    image: hillleft,
    // modified: 2025-10-09T11:10:29.888Z
  },
  hillright: {
    description: "Hill Right",
    image: hillright,
    // modified: 2025-10-09T11:10:29.888Z
  },
  hillwide: {
    description: "Hill Wide",
    image: hillwide,
    // modified: 2025-10-09T11:10:29.888Z
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
    // modified: 2025-10-09T11:10:29.888Z
  },
  table: {
    description: "Table",
    image: table,
    // modified: 2025-10-09T11:10:29.888Z
  },
  training: {
    description: "Training",
    image: training,
    // modified: 2025-10-09T11:10:29.888Z
  },
  training2: {
    description: "Training 2",
    image: training2,
    // modified: 2025-10-09T11:10:29.884Z
  },
};

const foxcorner = {
  title: "Fox Corner",
  group: "fox",
  presets: foxcornerPresets,
};

export default foxcorner;
