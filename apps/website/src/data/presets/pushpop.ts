import crunchwide from "@/assets/presets/pushpop/crunchwide.png";
import cubby from "@/assets/presets/pushpop/cubby.png";
import cubbyl from "@/assets/presets/pushpop/cubbyl.png";
import down from "@/assets/presets/pushpop/down.png";
import downcubby from "@/assets/presets/pushpop/downcubby.png";
import downl from "@/assets/presets/pushpop/downl.png";
import downr from "@/assets/presets/pushpop/downr.png";
import farcenter from "@/assets/presets/pushpop/farcenter.png";
import farfence from "@/assets/presets/pushpop/farfence.png";
import farleft from "@/assets/presets/pushpop/farleft.png";
import farright from "@/assets/presets/pushpop/farright.png";
import home from "@/assets/presets/pushpop/home.png";
import hut from "@/assets/presets/pushpop/hut.png";
import hutz from "@/assets/presets/pushpop/hutz.png";
import insidedoor from "@/assets/presets/pushpop/insidedoor.png";
import left from "@/assets/presets/pushpop/left.png";
import right from "@/assets/presets/pushpop/right.png";
import water from "@/assets/presets/pushpop/water.png";

import type { Preset } from "../tech/cameras.types";

const pushpopPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.332Z
  },
  crunchwide: {
    description: "Crunch Wide",
    image: crunchwide,
    // modified: 2025-10-09T11:10:30.344Z
  },
  cubby: {
    description: "Cubby",
    image: cubby,
    // modified: 2025-10-09T11:10:30.336Z
  },
  cubbyl: {
    description: "Cubby Left",
    image: cubbyl,
    // modified: 2025-10-09T11:10:30.344Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.336Z
  },
  downcubby: {
    description: "Down Cubby",
    image: downcubby,
    // modified: 2025-10-09T11:10:30.336Z
  },
  downl: {
    description: "Down Left",
    image: downl,
    // modified: 2025-10-09T11:10:30.336Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    // modified: 2025-10-09T11:10:30.340Z
  },
  farcenter: {
    description: "Far Center",
    image: farcenter,
    // modified: 2025-10-09T11:10:30.340Z
  },
  farfence: {
    description: "Far Fence",
    image: farfence,
    // modified: 2025-10-09T11:10:30.340Z
  },
  farleft: {
    description: "Far Left",
    image: farleft,
    // modified: 2025-10-09T11:10:30.340Z
  },
  farright: {
    description: "Far Right",
    image: farright,
    // modified: 2025-10-09T11:10:30.340Z
  },
  hut: {
    description: "Hut",
    image: hut,
    // modified: 2025-10-09T11:10:30.340Z
  },
  hutz: {
    description: "Hut Zoomed",
    image: hutz,
    // modified: 2025-10-09T11:10:30.340Z
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
    // modified: 2025-10-09T11:10:30.344Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-09T11:10:30.344Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:30.348Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:30.344Z
  },
};

const pushpop = {
  title: "Pushpop",
  group: "pushpop",
  presets: pushpopPresets,
};

export default pushpop;
