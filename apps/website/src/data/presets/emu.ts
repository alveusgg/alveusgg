import feeder from "@/assets/presets/emu/feeder.png";
import feedwide from "@/assets/presets/emu/feedwide.png";
import foodleft from "@/assets/presets/emu/foodleft.png";
import foodright from "@/assets/presets/emu/foodright.png";
import gate from "@/assets/presets/emu/gate.png";
import gateleft from "@/assets/presets/emu/gateleft.png";
import home from "@/assets/presets/emu/home.png";
import marmgate from "@/assets/presets/emu/marmgate.png";
import marmwin3 from "@/assets/presets/emu/marmwin3.png";
import marmwindows from "@/assets/presets/emu/marmwindows.png";
import pen1center from "@/assets/presets/emu/pen1center.png";
import pen1centerright from "@/assets/presets/emu/pen1centerright.png";
import pen1left from "@/assets/presets/emu/pen1left.png";
import pen1right from "@/assets/presets/emu/pen1right.png";
import pen1shelter from "@/assets/presets/emu/pen1shelter.png";
import pen2left from "@/assets/presets/emu/pen2left.png";
import pen2middleish from "@/assets/presets/emu/pen2middleish.png";
import pen2right from "@/assets/presets/emu/pen2right.png";

import type { Preset } from "../tech/cameras.types";

const emuPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.328Z
  },
  feeder: {
    description: "feeder",
    image: feeder,
    // modified: 2025-10-25T18:38:15.313Z
  },
  feedwide: {
    description: "feedwide",
    image: feedwide,
    // modified: 2025-10-28T22:40:32.291Z
  },
  foodleft: {
    description: "Food Left",
    image: foodleft,
    // modified: 2025-10-09T11:10:30.324Z
  },
  foodright: {
    description: "Food Right",
    image: foodright,
    // modified: 2025-10-09T11:10:30.324Z
  },
  gate: {
    description: "Gate",
    image: gate,
    // modified: 2025-10-09T11:10:30.324Z
  },
  gateleft: {
    description: "Gate Left",
    image: gateleft,
    // modified: 2025-10-09T11:10:30.332Z
  },
  marmgate: {
    description: "Marmoset Gate",
    image: marmgate,
    // modified: 2025-10-09T11:10:30.328Z
  },
  marmwin3: {
    description: "Marmoset Window 3",
    image: marmwin3,
    // modified: 2025-10-09T11:10:30.332Z
  },
  marmwindows: {
    description: "Marmoset Windows",
    image: marmwindows,
    // modified: 2025-10-09T11:10:30.332Z
  },
  pen1center: {
    description: "Pen 1 Center",
    image: pen1center,
    // modified: 2025-10-09T11:10:30.328Z
  },
  pen1centerright: {
    description: "Pen 1 Center Right",
    image: pen1centerright,
    // modified: 2025-10-09T11:10:30.332Z
  },
  pen1left: {
    description: "Pen 1 Left",
    image: pen1left,
    // modified: 2025-10-09T11:10:30.328Z
  },
  pen1right: {
    description: "Pen 1 Right",
    image: pen1right,
    // modified: 2025-10-09T11:10:30.328Z
  },
  pen1shelter: {
    description: "Pen 1 Shelter",
    image: pen1shelter,
    // modified: 2025-10-09T11:10:30.332Z
  },
  pen2left: {
    description: "Pen 2 Left",
    image: pen2left,
    // modified: 2025-10-09T11:10:30.324Z
  },
  pen2middleish: {
    description: "Pen 2 Middle-ish",
    image: pen2middleish,
    // modified: 2025-12-04T00:17:59.334Z
  },
  pen2right: {
    description: "Pen 2 Right",
    image: pen2right,
    // modified: 2025-10-09T11:10:30.324Z
  },
};

const emu = {
  title: "Emu",
  group: "emu",
  presets: emuPresets,
};

export default emu;
