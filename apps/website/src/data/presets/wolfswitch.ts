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
    // modified: 2025-10-09T11:10:30.396Z
  },
  back: {
    description: "Back",
    image: back,
    // modified: 2025-10-09T11:10:30.408Z
  },
  den: {
    description: "Den",
    image: den,
    // modified: 2025-10-09T11:10:30.396Z
  },
  denl: {
    description: "Den Left",
    image: denl,
    // modified: 2025-11-30T18:56:37.816Z
  },
  denr: {
    description: "Den Right",
    image: denr,
    // modified: 2025-11-30T18:56:37.816Z
  },
  dentop: {
    description: "Den Top",
    image: dentop,
    // modified: 2025-10-09T11:10:30.400Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.400Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    // modified: 2025-10-09T11:10:30.396Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    // modified: 2025-10-09T11:10:30.396Z
  },
  farleft: {
    description: "Far Left",
    image: farleft,
    // modified: 2025-10-09T11:10:30.396Z
  },
  farright: {
    description: "Far Right",
    image: farright,
    // modified: 2025-10-09T11:10:30.396Z
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
    // modified: 2025-10-09T11:10:30.400Z
  },
  left: {
    description: "left",
    image: left,
    // modified: 2025-11-03T22:57:47.957Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    // modified: 2025-10-09T11:10:30.412Z
  },
  middleleft: {
    description: "Middle Left",
    image: middleleft,
    // modified: 2025-11-30T18:56:37.816Z
  },
  pond: {
    description: "Pond",
    image: pond,
    // modified: 2025-11-30T18:56:37.816Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:30.408Z
  },
};

const wolfswitch = {
  title: "Wolf Switch",
  group: "wolf",
  presets: wolfswitchPresets,
};

export default wolfswitch;
