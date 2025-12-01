import missingscreenshot from "@/assets/presets/missing_screenshot.png";
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
import leftcorner from "@/assets/presets/wolfswitch/leftcorner.png";
import middleleft from "@/assets/presets/wolfswitch/middleleft.png";
import pond from "@/assets/presets/wolfswitch/pond.png";
import water from "@/assets/presets/wolfswitch/water.png";

import type { Preset } from "../tech/cameras.types";

const wolfswitchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  back: {
    description: "Back",
    image: back,
  },
  den: {
    description: "Den",
    image: den,
  },
  denl: {
    description: "Den Left",
    image: denl,
  },
  denr: {
    description: "Den Right",
    image: denr,
  },
  dentop: {
    description: "Den Top",
    image: dentop,
  },
  down: {
    description: "Down",
    image: down,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  farleft: {
    description: "Far Left",
    image: farleft,
  },
  farright: {
    description: "Far Right",
    image: farright,
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
  middleleft: {
    description: "Middle Left",
    image: middleleft,
  },
  pond: {
    description: "Pond",
    image: pond,
  },
  water: {
    description: "Water",
    image: water,
  },
  left: { description: "Left", image: missingscreenshot },
};

const wolfswitch = {
  title: "Wolf Switch",
  group: "wolf",
  presets: wolfswitchPresets,
};

export default wolfswitch;
