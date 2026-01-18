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
    position: { pan: -90.12, tilt: -21.63, zoom: 1 },
    // modified: 2025-10-09T11:10:30.332Z
  },
  crunchwide: {
    description: "Crunch Wide",
    image: crunchwide,
    position: { pan: -87.37, tilt: -55.54, zoom: 1 },
    // modified: 2025-10-09T11:10:30.344Z
  },
  cubby: {
    description: "Cubby",
    image: cubby,
    position: { pan: 87.62, tilt: -40.12, zoom: 1 },
    // modified: 2025-10-09T11:10:30.336Z
  },
  cubbyl: {
    description: "Cubby Left",
    image: cubbyl,
    position: { pan: 70.35, tilt: -30.79, zoom: 2370 },
    // modified: 2025-10-09T11:10:30.344Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -98.83, tilt: -53.06, zoom: 1 },
    // modified: 2025-10-09T11:10:30.336Z
  },
  downcubby: {
    description: "Down Cubby",
    image: downcubby,
    position: { pan: 117.18, tilt: -64.94, zoom: 1 },
    // modified: 2025-10-09T11:10:30.336Z
  },
  downl: {
    description: "Down Left",
    image: downl,
    position: { pan: -155.25, tilt: -66.61, zoom: 1 },
    // modified: 2025-10-09T11:10:30.336Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    position: { pan: -60.37, tilt: -42.07, zoom: 1 },
    // modified: 2025-10-09T11:10:30.340Z
  },
  farcenter: {
    description: "Far Center",
    image: farcenter,
    position: { pan: -98.54, tilt: -6.62, zoom: 874 },
    // modified: 2025-10-09T11:10:30.340Z
  },
  farfence: {
    description: "Far Fence",
    image: farfence,
    position: { pan: -96.54, tilt: -6.22, zoom: 348 },
    // modified: 2025-10-09T11:10:30.340Z
  },
  farleft: {
    description: "Far Left",
    image: farleft,
    position: { pan: -107.14, tilt: -6.77, zoom: 874 },
    // modified: 2025-10-09T11:10:30.340Z
  },
  farright: {
    description: "Far Right",
    image: farright,
    position: { pan: -88.26, tilt: -6.47, zoom: 874 },
    // modified: 2025-10-09T11:10:30.340Z
  },
  hut: {
    description: "Hut",
    image: hut,
    position: { pan: -85.68, tilt: -8.29, zoom: 399 },
    // modified: 2025-10-09T11:10:30.340Z
  },
  hutz: {
    description: "Hut Zoomed",
    image: hutz,
    position: { pan: -84.95, tilt: -11.21, zoom: 1777 },
    // modified: 2025-10-09T11:10:30.340Z
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
    position: { pan: -33.58, tilt: -30.48, zoom: 172 },
    // modified: 2025-10-09T11:10:30.344Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -108.09, tilt: -21, zoom: 1 },
    // modified: 2025-10-09T11:10:30.344Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -68.73, tilt: -18.7, zoom: 1 },
    // modified: 2025-10-09T11:10:30.348Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -102.92, tilt: -17.55, zoom: 458 },
    // modified: 2025-10-09T11:10:30.344Z
  },
};

const pushpop = {
  title: "Pushpop",
  group: "pushpop",
  presets: pushpopPresets,
};

export default pushpop;
