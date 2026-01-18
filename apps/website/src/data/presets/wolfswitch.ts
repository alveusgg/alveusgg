import back from "@/assets/presets/wolfswitch/back.png";
import den from "@/assets/presets/wolfswitch/den.png";
import denl from "@/assets/presets/wolfswitch/denl.png";
import denr from "@/assets/presets/wolfswitch/denr.png";
import dentop from "@/assets/presets/wolfswitch/dentop.png";
import down from "@/assets/presets/wolfswitch/down.png";
import downleft from "@/assets/presets/wolfswitch/downleft.png";
import downright from "@/assets/presets/wolfswitch/downright.png";
import farleft from "@/assets/presets/wolfswitch/farleft.png";
import farright from "@/assets/presets/wolfswitch/farright.png";
import home from "@/assets/presets/wolfswitch/home.png";
import insidedoor from "@/assets/presets/wolfswitch/insidedoor.png";
import left from "@/assets/presets/wolfswitch/left.png";
import leftcorner from "@/assets/presets/wolfswitch/leftcorner.png";
import middleleft from "@/assets/presets/wolfswitch/middleleft.png";
import pond from "@/assets/presets/wolfswitch/pond.png";
import water from "@/assets/presets/wolfswitch/water.png";

import type { Preset } from "../tech/cameras.types";

const wolfswitchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -61.46, tilt: -21.65, zoom: 1 },
    // modified: 2025-10-09T11:10:30.396Z
  },
  back: {
    description: "Back",
    image: back,
    position: { pan: -54.08, tilt: -6.1, zoom: 725 },
    // modified: 2025-10-09T11:10:30.408Z
  },
  den: {
    description: "Den",
    image: den,
    position: { pan: -51.77, tilt: -6.1, zoom: 3093 },
    // modified: 2025-10-09T11:10:30.396Z
  },
  denl: {
    description: "Den Left",
    image: denl,
    position: { pan: -53.21, tilt: -7.08, zoom: 5852 },
    // modified: 2025-11-30T18:56:37.816Z
  },
  denr: {
    description: "Den Right",
    image: denr,
    position: { pan: -51.25, tilt: -6.93, zoom: 4092 },
    // modified: 2025-11-30T18:56:37.816Z
  },
  dentop: {
    description: "Den Top",
    image: dentop,
    position: { pan: -51.72, tilt: -1.19, zoom: 2237 },
    // modified: 2025-10-09T11:10:30.400Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -61.14, tilt: -47.92, zoom: 1 },
    // modified: 2025-10-09T11:10:30.400Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    position: { pan: -112.47, tilt: -31.27, zoom: 1 },
    // modified: 2025-10-09T11:10:30.396Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: 4.51, tilt: -63.27, zoom: 27 },
    // modified: 2025-10-09T11:10:30.396Z
  },
  farleft: {
    description: "Far Left",
    image: farleft,
    position: { pan: -61.93, tilt: -5.81, zoom: 6270 },
    // modified: 2025-10-09T11:10:30.396Z
  },
  farright: {
    description: "Far Right",
    image: farright,
    position: { pan: -46.3, tilt: -6.07, zoom: 3093 },
    // modified: 2025-10-09T11:10:30.396Z
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
    position: { pan: -62.65, tilt: -83.78, zoom: 27 },
    // modified: 2025-10-09T11:10:30.400Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -81.65, tilt: -21.82, zoom: 1 },
    // modified: 2025-11-03T22:57:47.957Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -112.41, tilt: -31.24, zoom: 1 },
    // modified: 2025-10-09T11:10:30.412Z
  },
  middleleft: {
    description: "Middle Left",
    image: middleleft,
    position: { pan: -71.21, tilt: -14.12, zoom: 482 },
    // modified: 2025-11-30T18:56:37.816Z
  },
  pond: {
    description: "Pond",
    image: pond,
    position: { pan: 2.51, tilt: -8.07, zoom: 741 },
    // modified: 2025-11-30T18:56:37.816Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -99.13, tilt: -22.28, zoom: 258 },
    // modified: 2025-10-09T11:10:30.408Z
  },
};

const wolfswitch = {
  title: "Wolf Switch",
  group: "wolf",
  presets: wolfswitchPresets,
};

export default wolfswitch;
