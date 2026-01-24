import bowld from "@/assets/presets/macaws/bowld.png";
import bowlr from "@/assets/presets/macaws/bowlr.png";
import closebranches from "@/assets/presets/macaws/closebranches.png";
import home from "@/assets/presets/macaws/home.png";
import perchbr from "@/assets/presets/macaws/perchbr.png";
import postmb from "@/assets/presets/macaws/postmb.png";
import postmt from "@/assets/presets/macaws/postmt.png";
import right from "@/assets/presets/macaws/right.png";
import water from "@/assets/presets/macaws/water.png";
import window from "@/assets/presets/macaws/window.png";
import winl from "@/assets/presets/macaws/winl.png";
import winr from "@/assets/presets/macaws/winr.png";
import winrf from "@/assets/presets/macaws/winrf.png";

import type { Preset } from "../tech/cameras.types";

const macawsPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 175.04, tilt: -23.15, zoom: 1 },
    // modified: 2025-10-13T21:22:42.909Z
  },
  bowld: {
    description: "bowld",
    image: bowld,
    position: { pan: -159.8, tilt: -59.98, zoom: 345 },
    // modified: 2025-10-15T13:51:22.838Z
  },
  bowlr: {
    description: "bowlr",
    image: bowlr,
    position: { pan: -175.74, tilt: -10.1, zoom: 1905 },
    // modified: 2025-10-15T13:47:42.390Z
  },
  closebranches: {
    description: "closebranches",
    image: closebranches,
    position: { pan: -173.35, tilt: -32.25, zoom: 1 },
    // modified: 2026-01-04T17:41:33.617Z
  },
  perchbr: {
    description: "perchbr",
    image: perchbr,
    position: { pan: -145.77, tilt: -9.13, zoom: 345 },
    // modified: 2025-10-17T13:51:17.369Z
  },
  postmb: {
    description: "postmb",
    image: postmb,
    position: { pan: 165.63, tilt: -22.03, zoom: 601 },
    // modified: 2025-10-16T15:12:14.306Z
  },
  postmt: {
    description: "postmt",
    image: postmt,
    position: { pan: 165.63, tilt: -22.03, zoom: 601 },
    // modified: 2025-10-16T15:10:37.349Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -146.31, tilt: -24.15, zoom: 1 },
    // modified: 2025-10-13T21:24:01.163Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: 145.18, tilt: -26.72, zoom: 165 },
    // modified: 2025-10-13T21:12:07.003Z
  },
  window: {
    description: "Window",
    image: window,
    position: { pan: 174.6, tilt: -11.17, zoom: 1689 },
    // modified: 2025-10-31T16:33:29.976Z
  },
  winl: {
    description: "winl",
    image: winl,
    position: { pan: 170.97, tilt: -14.9, zoom: 768 },
    // modified: 2025-10-16T15:04:13.782Z
  },
  winr: {
    description: "winr",
    image: winr,
    position: { pan: 179.41, tilt: -10.84, zoom: 787 },
    // modified: 2025-11-07T14:12:21.543Z
  },
  winrf: {
    description: "winrf",
    image: winrf,
    position: { pan: 179.33, tilt: -13.43, zoom: 585 },
    // modified: 2025-12-15T21:35:47.893Z
  },
};

const macaws = {
  title: "Macaws",
  group: "parrot",
  presets: macawsPresets,
};

export default macaws;
