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
    // modified: 2025-10-13T21:22:42.909Z
  },
  bowld: {
    description: "bowld",
    image: bowld,
    // modified: 2025-10-15T13:51:22.838Z
  },
  bowlr: {
    description: "bowlr",
    image: bowlr,
    // modified: 2025-10-15T13:47:42.390Z
  },
  perchbr: {
    description: "perchbr",
    image: perchbr,
    // modified: 2025-10-17T13:51:17.369Z
  },
  postmb: {
    description: "postmb",
    image: postmb,
    // modified: 2025-10-16T15:12:14.306Z
  },
  postmt: {
    description: "postmt",
    image: postmt,
    // modified: 2025-10-16T15:10:37.349Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-13T21:24:01.163Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-13T21:12:07.003Z
  },
  window: {
    description: "Window",
    image: window,
    // modified: 2025-10-31T16:33:29.976Z
  },
  winl: {
    description: "winl",
    image: winl,
    // modified: 2025-10-16T15:04:13.782Z
  },
  winr: {
    description: "winr",
    image: winr,
    // modified: 2025-11-07T14:12:21.543Z
  },
};

const macaws = {
  title: "Macaws",
  group: "parrot",
  presets: macawsPresets,
};

export default macaws;
