import home from "@/assets/presets/macaws/home.png";
import right from "@/assets/presets/macaws/right.png";
import water from "@/assets/presets/macaws/water.png";
import window from "@/assets/presets/macaws/window.png";
import missingscreenshot from "@/assets/presets/missing_screenshot.png";

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
  bowlr: { description: "Bowl next to window", image: missingscreenshot },
  bowld: { description: "Down under camera", image: missingscreenshot },
  winl: { description: "Left of window", image: missingscreenshot },
  postmt: { description: "Middle left post top", image: missingscreenshot },
  postmb: { description: "Middle left post bottom", image: missingscreenshot },
  perchbr: { description: "Perch back right", image: missingscreenshot },
  winr: { description: "Right of window", image: missingscreenshot },
};

const macaws = {
  title: "Macaws",
  group: "parrot",
  presets: macawsPresets,
};

export default macaws;
