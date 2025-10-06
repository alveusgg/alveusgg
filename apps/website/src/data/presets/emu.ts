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
  },
  foodleft: {
    description: "Food Left",
    image: foodleft,
  },
  foodright: {
    description: "Food Right",
    image: foodright,
  },
  gate: {
    description: "Gate",
    image: gate,
  },
  gateleft: {
    description: "Gate Left",
    image: gateleft,
  },
  marmgate: {
    description: "Marmoset Gate",
    image: marmgate,
  },
  marmwin3: {
    description: "Marmoset Window 3",
    image: marmwin3,
  },
  marmwindows: {
    description: "Marmoset Windows",
    image: marmwindows,
  },
  pen1center: {
    description: "Pen 1 Center",
    image: pen1center,
  },
  pen1centerright: {
    description: "Pen 1 Center Right",
    image: pen1centerright,
  },
  pen1left: {
    description: "Pen 1 Left",
    image: pen1left,
  },
  pen1right: {
    description: "Pen 1 Right",
    image: pen1right,
  },
  pen1shelter: {
    description: "Pen 1 Shelter",
    image: pen1shelter,
  },
  pen2left: {
    description: "Pen 2 Left",
    image: pen2left,
  },
  pen2middleish: {
    description: "Pen 2 Middle-ish",
    image: pen2middleish,
  },
  pen2right: {
    description: "Pen 2 Right",
    image: pen2right,
  },
};

const emu = {
  title: "Emu",
  group: "emu",
  presets: emuPresets,
};

export default emu;
