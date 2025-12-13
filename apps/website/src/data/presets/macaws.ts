import bowld from "@/assets/presets/macaws/bowld.png";
import bowlr from "@/assets/presets/macaws/bowlr.png";
import home from "@/assets/presets/macaws/home.png";
import perchbr from "@/assets/presets/macaws/perchbr.png";
import postmb from "@/assets/presets/macaws/postmb.png";
import postmt from "@/assets/presets/macaws/postmt.png";
import right from "@/assets/presets/macaws/right.png";
import water from "@/assets/presets/macaws/water.png";
import window from "@/assets/presets/macaws/window.png";
import winl from "@/assets/presets/macaws/winl.png";
import winr from "@/assets/presets/macaws/winr.png";

import type { Preset } from "../tech/cameras.types";

const macawsPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  bowld: {
    description: "bowld",
    image: bowld,
  },
  bowlr: {
    description: "bowlr",
    image: bowlr,
  },
  perchbr: {
    description: "perchbr",
    image: perchbr,
  },
  postmb: {
    description: "postmb",
    image: postmb,
  },
  postmt: {
    description: "postmt",
    image: postmt,
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
  winl: {
    description: "winl",
    image: winl,
  },
  winr: {
    description: "winr",
    image: winr,
  },
};

const macaws = {
  title: "Macaws",
  group: "parrot",
  presets: macawsPresets,
};

export default macaws;
