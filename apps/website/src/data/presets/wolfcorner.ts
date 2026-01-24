import back from "@/assets/presets/wolfcorner/back.png";
import backfence from "@/assets/presets/wolfcorner/backfence.png";
import belowplatform from "@/assets/presets/wolfcorner/belowplatform.png";
import belowplatforml from "@/assets/presets/wolfcorner/belowplatforml.png";
import belowplatformr from "@/assets/presets/wolfcorner/belowplatformr.png";
import belowrampl from "@/assets/presets/wolfcorner/belowrampl.png";
import belowramplz from "@/assets/presets/wolfcorner/belowramplz.png";
import belowrampr from "@/assets/presets/wolfcorner/belowrampr.png";
import brushl from "@/assets/presets/wolfcorner/brushl.png";
import center from "@/assets/presets/wolfcorner/center.png";
import den1 from "@/assets/presets/wolfcorner/den1.png";
import den2 from "@/assets/presets/wolfcorner/den2.png";
import den2b from "@/assets/presets/wolfcorner/den2b.png";
import den2door from "@/assets/presets/wolfcorner/den2door.png";
import den2entrance from "@/assets/presets/wolfcorner/den2entrance.png";
import den2inside from "@/assets/presets/wolfcorner/den2inside.png";
import den2l from "@/assets/presets/wolfcorner/den2l.png";
import den2m from "@/assets/presets/wolfcorner/den2m.png";
import den2r from "@/assets/presets/wolfcorner/den2r.png";
import den2shade from "@/assets/presets/wolfcorner/den2shade.png";
import den2shadel from "@/assets/presets/wolfcorner/den2shadel.png";
import den2t from "@/assets/presets/wolfcorner/den2t.png";
import down from "@/assets/presets/wolfcorner/down.png";
import downleft from "@/assets/presets/wolfcorner/downleft.png";
import downright from "@/assets/presets/wolfcorner/downright.png";
import grass from "@/assets/presets/wolfcorner/grass.png";
import grassl from "@/assets/presets/wolfcorner/grassl.png";
import grassr from "@/assets/presets/wolfcorner/grassr.png";
import home from "@/assets/presets/wolfcorner/home.png";
import left from "@/assets/presets/wolfcorner/left.png";
import leftcorner from "@/assets/presets/wolfcorner/leftcorner.png";
import leftcornerw from "@/assets/presets/wolfcorner/leftcornerw.png";
import leftfence from "@/assets/presets/wolfcorner/leftfence.png";
import leftw from "@/assets/presets/wolfcorner/leftw.png";
import log from "@/assets/presets/wolfcorner/log.png";
import nearcorner from "@/assets/presets/wolfcorner/nearcorner.png";
import rampl from "@/assets/presets/wolfcorner/rampl.png";
import rampr from "@/assets/presets/wolfcorner/rampr.png";
import right from "@/assets/presets/wolfcorner/right.png";
import rightcorner from "@/assets/presets/wolfcorner/rightcorner.png";
import rightfence from "@/assets/presets/wolfcorner/rightfence.png";
import river from "@/assets/presets/wolfcorner/river.png";
import switchpen from "@/assets/presets/wolfcorner/switchpen.png";
import trees from "@/assets/presets/wolfcorner/trees.png";
import treesl from "@/assets/presets/wolfcorner/treesl.png";
import water from "@/assets/presets/wolfcorner/water.png";
import wolfcam from "@/assets/presets/wolfcorner/wolfcam.png";

import type { Preset } from "../tech/cameras.types";

const wolfcornerPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -17.37, tilt: -11.26, zoom: 10840 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  back: {
    description: "Back",
    image: back,
    position: { pan: 17.58, tilt: -8.44, zoom: 211 },
    // modified: 2025-11-30T18:56:30.540Z
  },
  backfence: {
    description: "Back Fence",
    image: backfence,
    position: { pan: 15.8, tilt: -8.3, zoom: 397 },
    // modified: 2025-10-09T11:10:30.244Z
  },
  belowplatform: {
    description: "Below Platform",
    image: belowplatform,
    position: { pan: -139.25, tilt: -47.01, zoom: 1 },
    // modified: 2025-10-09T11:10:30.244Z
  },
  belowplatforml: {
    description: "Below Platform left",
    image: belowplatforml,
    position: { pan: 154.81, tilt: -57.31, zoom: 1 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  belowplatformr: {
    description: "Below Platform right",
    image: belowplatformr,
    position: { pan: -49.72, tilt: -36.38, zoom: 1 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  belowrampl: {
    description: "Below Ramp left",
    image: belowrampl,
    position: { pan: 5.48, tilt: -15.31, zoom: 1046 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  belowramplz: {
    description: "Below Ramp left zoomed",
    image: belowramplz,
    position: { pan: 8.08, tilt: -15.6, zoom: 1343 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  belowrampr: {
    description: "Below Ramp right",
    image: belowrampr,
    position: { pan: 35.47, tilt: -24.1, zoom: 397 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  brushl: {
    description: "Brush left",
    image: brushl,
    position: { pan: -26.02, tilt: -11.47, zoom: 741 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  center: {
    description: "Center",
    image: center,
    position: { pan: -13.64, tilt: -7.52, zoom: 415 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  den1: {
    description: "Den 1 (was visible once)",
    image: den1,
    position: { pan: -14.14, tilt: -2.58, zoom: 1700 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  den2: {
    description: "Den 2",
    image: den2,
    position: { pan: 15.75, tilt: -23.31, zoom: 1 },
    // modified: 2025-10-09T11:10:30.248Z
  },
  den2b: {
    description: "Den 2 bottom platform",
    image: den2b,
    position: { pan: 30.65, tilt: -15.45, zoom: 696 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  den2door: {
    description: "Den 2 'door'",
    image: den2door,
    position: { pan: 19.78, tilt: -35.14, zoom: 244 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  den2entrance: {
    description: "Den 2 entrance area",
    image: den2entrance,
    position: { pan: 42.91, tilt: -40.66, zoom: 1 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  den2inside: {
    description: "Den 2 inside",
    image: den2inside,
    position: { pan: 19.78, tilt: -32.33, zoom: 945 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  den2l: {
    description: "Den 2 left",
    image: den2l,
    position: { pan: -28.57, tilt: -34.56, zoom: 1 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  den2m: {
    description: "Den 2 middle platform",
    image: den2m,
    position: { pan: 15.76, tilt: -19.31, zoom: 300 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  den2r: {
    description: "Den 2 right",
    image: den2r,
    position: { pan: 58.21, tilt: -31.09, zoom: 692 },
    // modified: 2025-11-30T18:56:30.540Z
  },
  den2shade: {
    description: "Den 2 shade under top platform",
    image: den2shade,
    position: { pan: -1.3, tilt: -19.27, zoom: 500 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  den2shadel: {
    description: "Den 2 shade left",
    image: den2shadel,
    position: { pan: -8.31, tilt: -17.43, zoom: 500 },
    // modified: 2025-11-30T18:56:30.540Z
  },
  den2t: {
    description: "Den 2 top platform",
    image: den2t,
    position: { pan: 2.81, tilt: -8.83, zoom: 700 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 44.75, tilt: -50.48, zoom: 1 },
    // modified: 2025-10-09T11:10:30.252Z
  },
  downleft: {
    description: "Down left",
    image: downleft,
    position: { pan: 14.77, tilt: -54.29, zoom: 1 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  downright: {
    description: "Down right",
    image: downright,
    position: { pan: 102.93, tilt: -49.3, zoom: 1 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  grass: {
    description: "Grass",
    image: grass,
    position: { pan: -22.59, tilt: -6.54, zoom: 1298 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  grassl: {
    description: "Grass left",
    image: grassl,
    position: { pan: -29.68, tilt: -6.42, zoom: 1298 },
    // modified: 2025-10-09T11:10:30.240Z
  },
  grassr: {
    description: "Grass right",
    image: grassr,
    position: { pan: -20.07, tilt: -6.04, zoom: 1298 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -24.13, tilt: -7.02, zoom: 332 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -29.61, tilt: -3, zoom: 2893 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  leftcornerw: {
    description: "Left Corner wide",
    image: leftcornerw,
    position: { pan: -27.55, tilt: -3.01, zoom: 1287 },
    // modified: 2025-10-09T11:10:30.240Z
  },
  leftfence: {
    description: "Left Fence",
    image: leftfence,
    position: { pan: -37.64, tilt: -17.57, zoom: 1 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  leftw: {
    description: "Left wide",
    image: leftw,
    position: { pan: -17.37, tilt: -11.26, zoom: 1 },
    // modified: 2025-10-09T11:10:30.256Z
  },
  log: {
    description: "Training Log",
    image: log,
    position: { pan: 99.66, tilt: -27.91, zoom: 359 },
    // modified: 2025-10-09T11:10:30.244Z
  },
  nearcorner: {
    description: "Near Corner",
    image: nearcorner,
    position: { pan: -157.11, tilt: -38.54, zoom: 276 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  rampl: {
    description: "Ramp left",
    image: rampl,
    position: { pan: 11.97, tilt: -14.47, zoom: 797 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  rampr: {
    description: "Ramp right",
    image: rampr,
    position: { pan: 26.04, tilt: -15.63, zoom: 599 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 54.75, tilt: -21.3, zoom: 1 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    position: { pan: 70.61, tilt: -11.73, zoom: 307 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  rightfence: {
    description: "Right Fence",
    image: rightfence,
    position: { pan: 81.96, tilt: -25.78, zoom: 1 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  river: {
    description: "River",
    image: river,
    position: { pan: -22.14, tilt: -2.85, zoom: 2261 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  switchpen: {
    description: "Switch Pen",
    image: switchpen,
    position: { pan: -23.77, tilt: -2.63, zoom: 4494 },
    // modified: 2025-10-09T11:10:30.240Z
  },
  trees: {
    description: "Trees",
    image: trees,
    position: { pan: -20.92, tilt: -5.26, zoom: 2304 },
    // modified: 2025-11-30T18:56:30.540Z
  },
  treesl: {
    description: "Trees left",
    image: treesl,
    position: { pan: -24.82, tilt: -5.32, zoom: 646 },
    // modified: 2025-10-09T11:10:30.244Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -121.23, tilt: -42.67, zoom: 247 },
    // modified: 2025-10-09T11:10:30.260Z
  },
  wolfcam: {
    description: "Wolf Cam",
    image: wolfcam,
    position: { pan: -30.28, tilt: -1.37, zoom: 6000 },
    // modified: 2025-10-09T11:10:30.260Z
  },
};

const wolfcorner = {
  title: "Wolf Corner",
  group: "wolf",
  presets: wolfcornerPresets,
};

export default wolfcorner;
