import home from "@/assets/presets/macaws/home.png";
import right from "@/assets/presets/macaws/right.png";
import water from "@/assets/presets/macaws/water.png";
import window from "@/assets/presets/macaws/window.png";

import type { Preset } from "../tech/cameras.types";

const macawsPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  right: {
    description: "Right",
    image: right,
  },
  water: {
    description: "Water",
    image: water,
  },
  window: {
    description: "Window",
    image: window,
  },
  bowlr: { description: "Bowl next to window" },
  bowld: { description: "Down under camera" },
  winl: { description: "Left of window" },
  postmt: { description: "Middle left post top" },
  postmb: { description: "Middle left post bottom" },
  perchbr: { description: "Perch back right" },
  winr: { description: "Right of window" },
};

const macaws = {
  title: "Macaws",
  group: "parrot",
  presets: macawsPresets,
};

export default macaws;
