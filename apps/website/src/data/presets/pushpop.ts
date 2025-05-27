import crunchwide from "@/assets/presets/pushpop/crunchwide.png";
import cubby from "@/assets/presets/pushpop/cubby.png";
import down from "@/assets/presets/pushpop/down.png";
import downcubby from "@/assets/presets/pushpop/downcubby.png";
import downl from "@/assets/presets/pushpop/downl.png";
import downr from "@/assets/presets/pushpop/downr.png";
import farfence from "@/assets/presets/pushpop/farfence.png";
import home from "@/assets/presets/pushpop/home.png";
import hut from "@/assets/presets/pushpop/hut.png";
import insidedoor from "@/assets/presets/pushpop/insidedoor.png";
import left from "@/assets/presets/pushpop/left.png";
import right from "@/assets/presets/pushpop/right.png";
import water from "@/assets/presets/pushpop/water.png";

import type { Preset } from "../tech/cameras.types.ts";

const pushpopPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  crunchwide: {
    description: "Crunch Wide",
    image: crunchwide,
  },
  cubby: {
    description: "Cubby",
    image: cubby,
  },
  down: {
    description: "Down",
    image: down,
  },
  downcubby: {
    description: "Down Cubby",
    image: downcubby,
  },
  downl: {
    description: "Down Left",
    image: downl,
  },
  downr: {
    description: "Down Right",
    image: downr,
  },
  farfence: {
    description: "Far Fence",
    image: farfence,
  },
  hut: {
    description: "Hut",
    image: hut,
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
  },
  left: {
    description: "Left",
    image: left,
  },
  right: {
    description: "Right",
    image: right,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const pushpop = {
  title: "Pushpop",
  group: "pushpop",
  presets: pushpopPresets,
};

export default pushpop;
