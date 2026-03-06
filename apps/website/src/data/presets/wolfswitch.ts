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
import middle from "@/assets/presets/wolfswitch/middle.png";
import middleleft from "@/assets/presets/wolfswitch/middleleft.png";
import middleright from "@/assets/presets/wolfswitch/middleright.png";
import nearleft from "@/assets/presets/wolfswitch/nearleft.png";
import nearright from "@/assets/presets/wolfswitch/nearright.png";
import pond from "@/assets/presets/wolfswitch/pond.png";
import switchgate from "@/assets/presets/wolfswitch/switchgate.png";

import type { Preset } from "../tech/cameras.types";

const wolfswitchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 12.53, tilt: -15.34, zoom: 1 },
    // modified: 2026-03-05T22:21:01.968Z
  },
  back: {
    description: "Back",
    image: back,
    position: { pan: 14.82, tilt: -4.68, zoom: 256 },
    // modified: 2026-03-05T23:41:38.795Z
  },
  den: {
    description: "Den",
    image: den,
    position: { pan: 17.69, tilt: -5.27, zoom: 1134 },
    // modified: 2026-03-05T23:50:19.921Z
  },
  denl: {
    description: "Den Left",
    image: denl,
    position: { pan: 15.55, tilt: -6.24, zoom: 1412 },
    // modified: 2026-03-05T23:54:05.333Z
  },
  denr: {
    description: "Den Right",
    image: denr,
    position: { pan: 19.63, tilt: -5.62, zoom: 1134 },
    // modified: 2026-03-05T23:47:26.509Z
  },
  dentop: {
    description: "Den Top",
    image: dentop,
    position: { pan: 17.45, tilt: -0.32, zoom: 1134 },
    // modified: 2026-03-05T23:43:28.713Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 15.07, tilt: -45.13, zoom: 1 },
    // modified: 2026-03-06T00:00:16.219Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    position: { pan: -20.6, tilt: -61.59, zoom: 1 },
    // modified: 2026-03-05T23:58:58.650Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: 72.89, tilt: -63.07, zoom: 1 },
    // modified: 2026-03-06T00:01:02.356Z
  },
  farleft: {
    description: "Far Left",
    image: farleft,
    position: { pan: 7.96, tilt: -5.62, zoom: 835 },
    // modified: 2026-03-05T23:56:05.723Z
  },
  farright: {
    description: "Far Right",
    image: farright,
    position: { pan: 23.16, tilt: -4.06, zoom: 1134 },
    // modified: 2026-03-05T23:52:32.791Z
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
    position: { pan: 18.16, tilt: -78.98, zoom: 1 },
    // modified: 2026-03-06T00:01:36.657Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -12.35, tilt: -20.16, zoom: 1 },
    // modified: 2026-03-05T23:39:29.177Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -47.41, tilt: -34.2, zoom: 1 },
    // modified: 2026-03-05T23:58:19.125Z
  },
  middle: {
    description: "middle",
    image: middle,
    position: { pan: 6.96, tilt: -24.74, zoom: 1 },
    // modified: 2026-03-06T00:07:28.787Z
  },
  middleleft: {
    description: "Middle Left",
    image: middleleft,
    position: { pan: -1.96, tilt: -13.3, zoom: 161 },
    // modified: 2026-03-05T23:40:02.581Z
  },
  middleright: {
    description: "middleright",
    image: middleright,
    position: { pan: 25.5, tilt: -13.02, zoom: 258 },
    // modified: 2026-03-06T00:05:32.113Z
  },
  nearleft: {
    description: "nearleft",
    image: nearleft,
    position: { pan: -30.35, tilt: -25.54, zoom: 15 },
    // modified: 2026-03-06T00:10:21.274Z
  },
  nearright: {
    description: "nearright",
    image: nearright,
    position: { pan: 32.67, tilt: -36.12, zoom: 1 },
    // modified: 2026-03-06T00:09:40.113Z
  },
  pond: {
    description: "Pond",
    image: pond,
    position: { pan: 70.11, tilt: -7.53, zoom: 644 },
    // modified: 2026-03-05T23:57:36.737Z
  },
  switchgate: {
    description: "switchgate",
    image: switchgate,
    position: { pan: 29.51, tilt: -18.58, zoom: 161 },
    // modified: 2026-03-05T23:45:44.127Z
  },
};

const wolfswitch = {
  title: "Wolf Switch",
  group: "wolf",
  presets: wolfswitchPresets,
};

export default wolfswitch;
