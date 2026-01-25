import akelafood from "@/assets/presets/wolf/akelafood.png";
import backleftcorner from "@/assets/presets/wolf/backleftcorner.png";
import belowplatform from "@/assets/presets/wolf/belowplatform.png";
import bigrocks from "@/assets/presets/wolf/bigrocks.png";
import center from "@/assets/presets/wolf/center.png";
import den1 from "@/assets/presets/wolf/den1.png";
import den1feed from "@/assets/presets/wolf/den1feed.png";
import den1inside from "@/assets/presets/wolf/den1inside.png";
import den1l from "@/assets/presets/wolf/den1l.png";
import den1r from "@/assets/presets/wolf/den1r.png";
import den1t from "@/assets/presets/wolf/den1t.png";
import den1tz from "@/assets/presets/wolf/den1tz.png";
import den2 from "@/assets/presets/wolf/den2.png";
import den2b from "@/assets/presets/wolf/den2b.png";
import den2gap from "@/assets/presets/wolf/den2gap.png";
import den2l from "@/assets/presets/wolf/den2l.png";
import den2m from "@/assets/presets/wolf/den2m.png";
import den2mz from "@/assets/presets/wolf/den2mz.png";
import den2r from "@/assets/presets/wolf/den2r.png";
import den2rw from "@/assets/presets/wolf/den2rw.png";
import den2t from "@/assets/presets/wolf/den2t.png";
import den2w from "@/assets/presets/wolf/den2w.png";
import down from "@/assets/presets/wolf/down.png";
import downright from "@/assets/presets/wolf/downright.png";
import farcorner from "@/assets/presets/wolf/farcorner.png";
import farfence from "@/assets/presets/wolf/farfence.png";
import grass from "@/assets/presets/wolf/grass.png";
import grassl from "@/assets/presets/wolf/grassl.png";
import home from "@/assets/presets/wolf/home.png";
import insidedoor from "@/assets/presets/wolf/insidedoor.png";
import left from "@/assets/presets/wolf/left.png";
import leftcorner from "@/assets/presets/wolf/leftcorner.png";
import log from "@/assets/presets/wolf/log.png";
import neargrass from "@/assets/presets/wolf/neargrass.png";
import neargrassr from "@/assets/presets/wolf/neargrassr.png";
import pond from "@/assets/presets/wolf/pond.png";
import pump from "@/assets/presets/wolf/pump.png";
import right from "@/assets/presets/wolf/right.png";
import rightfence from "@/assets/presets/wolf/rightfence.png";
import river from "@/assets/presets/wolf/river.png";
import shaft from "@/assets/presets/wolf/shaft.png";
import switchden from "@/assets/presets/wolf/switchden.png";
import switchgatel from "@/assets/presets/wolf/switchgatel.png";
import switchgater from "@/assets/presets/wolf/switchgater.png";
import switchpen from "@/assets/presets/wolf/switchpen.png";
import switchpenl from "@/assets/presets/wolf/switchpenl.png";
import switchpenr from "@/assets/presets/wolf/switchpenr.png";
import switchramp from "@/assets/presets/wolf/switchramp.png";
import tip from "@/assets/presets/wolf/tip.png";
import tipmo from "@/assets/presets/wolf/tipmo.png";
import trees from "@/assets/presets/wolf/trees.png";
import waterfall from "@/assets/presets/wolf/waterfall.png";
import wolfcornercam from "@/assets/presets/wolf/wolfcornercam.png";

import type { Preset } from "../tech/cameras.types";

const wolfPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 129.27, tilt: -10.22, zoom: 1 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  akelafood: {
    description: "Akela Food",
    image: akelafood,
    position: { pan: 152.09, tilt: -16.79, zoom: 334 },
    // modified: 2025-11-30T18:56:13.336Z
  },
  backleftcorner: {
    description: "Back Left Corner",
    image: backleftcorner,
    position: { pan: 50.13, tilt: -4.16, zoom: 347 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  belowplatform: {
    description: "Below Platform",
    image: belowplatform,
    position: { pan: 151.59, tilt: 0.65, zoom: 1143 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  bigrocks: {
    description: "Big Rocks",
    image: bigrocks,
    position: { pan: 124.85, tilt: -0.22, zoom: 1502 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  center: {
    description: "Center",
    image: center,
    position: { pan: 127.31, tilt: -1.31, zoom: 166 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den1: {
    description: "Den 1",
    image: den1,
    position: { pan: 87.36, tilt: -3.41, zoom: 206 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den1feed: {
    description: "Den 1 feeding spot",
    image: den1feed,
    position: { pan: 71.68, tilt: -6.1, zoom: 1878 },
    // modified: 2025-10-09T11:10:30.176Z
  },
  den1inside: {
    description: "Den 1 inside",
    image: den1inside,
    position: { pan: 86.15, tilt: -5.88, zoom: 1121 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den1l: {
    description: "Den 1 left",
    image: den1l,
    position: { pan: 68.4, tilt: -4.41, zoom: 206 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den1r: {
    description: "Den 1 right",
    image: den1r,
    position: { pan: 107.77, tilt: -2.96, zoom: 206 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den1t: {
    description: "Den 1 top",
    image: den1t,
    position: { pan: 87.79, tilt: 1.01, zoom: 861 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den1tz: {
    description: "Den 1 top zoomed",
    image: den1tz,
    position: { pan: 87.02, tilt: 0.9, zoom: 2370 },
    // modified: 2025-11-30T18:56:13.336Z
  },
  den2: {
    description: "Den 2",
    image: den2,
    position: { pan: 144.94, tilt: 0.9, zoom: 1950 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den2b: {
    description: "Den 2 bottom",
    image: den2b,
    position: { pan: 144.94, tilt: 0.09, zoom: 4231 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den2gap: {
    description: "Den 2 gap",
    image: den2gap,
    position: { pan: 143.7, tilt: -0.1, zoom: 6511 },
    // modified: 2025-10-09T11:10:30.180Z
  },
  den2l: {
    description: "Den 2 left",
    image: den2l,
    position: { pan: 141.87, tilt: 0.43, zoom: 1950 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  den2m: {
    description: "Den 2 middle",
    image: den2m,
    position: { pan: 145.72, tilt: 1.18, zoom: 4231 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  den2mz: {
    description: "Den 2 middle zoomed",
    image: den2mz,
    position: { pan: 146.1, tilt: 1.15, zoom: 10294 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  den2r: {
    description: "Den 2 right",
    image: den2r,
    position: { pan: 148.51, tilt: 0.52, zoom: 1950 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  den2rw: {
    description: "Den 2 right wide",
    image: den2rw,
    position: { pan: 149.32, tilt: 0.39, zoom: 936 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  den2t: {
    description: "Den 2 top",
    image: den2t,
    position: { pan: 144.75, tilt: 2.08, zoom: 4231 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  den2w: {
    description: "Den 2 wide",
    image: den2w,
    position: { pan: 144.21, tilt: 0.36, zoom: 936 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 63.63, tilt: -26.91, zoom: 1 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: 129.52, tilt: -36.29, zoom: 1 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  farcorner: {
    description: "Far Corner",
    image: farcorner,
    position: { pan: 134.32, tilt: 0.43, zoom: 1763 },
    // modified: 2025-10-09T11:10:30.184Z
  },
  farfence: {
    description: "Far Fence",
    image: farfence,
    position: { pan: 143.77, tilt: 0.52, zoom: 406 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  grass: {
    description: "Grass",
    image: grass,
    position: { pan: 146.68, tilt: -0.63, zoom: 936 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  grassl: {
    description: "Grass left",
    image: grassl,
    position: { pan: 143.34, tilt: -0.92, zoom: 936 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
    position: { pan: -21.25, tilt: -61.06, zoom: 1 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: 42.5, tilt: -10.5, zoom: 1 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -5.21, tilt: -26.64, zoom: 1 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  log: {
    description: "Log/training spot",
    image: log,
    position: { pan: 64.86, tilt: -3.26, zoom: 1879 },
    // modified: 2025-11-30T18:56:13.336Z
  },
  neargrass: {
    description: "Near Grass",
    image: neargrass,
    position: { pan: 142.08, tilt: -4.41, zoom: 826 },
    // modified: 2025-10-09T11:10:30.176Z
  },
  neargrassr: {
    description: "Near Grass Right",
    image: neargrassr,
    position: { pan: 148.94, tilt: -3.58, zoom: 682 },
    // modified: 2025-10-09T11:10:30.176Z
  },
  pond: {
    description: "Pond",
    image: pond,
    position: { pan: 76.37, tilt: -12.26, zoom: 280 },
    // modified: 2025-10-09T11:10:30.188Z
  },
  pump: {
    description: "Pump",
    image: pump,
    position: { pan: 58.99, tilt: -13.46, zoom: 265 },
    // modified: 2025-11-30T18:56:13.336Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 133.78, tilt: -3.12, zoom: 1 },
    // modified: 2025-10-09T11:10:30.192Z
  },
  rightfence: {
    description: "Right Fence",
    image: rightfence,
    position: { pan: 144.21, tilt: -9.65, zoom: 1 },
    // modified: 2025-10-09T11:10:30.192Z
  },
  river: {
    description: "River",
    image: river,
    position: { pan: 90.45, tilt: -9.66, zoom: 1 },
    // modified: 2025-10-09T11:10:30.192Z
  },
  shaft: {
    description: "Shaft",
    image: shaft,
    position: { pan: 101.4, tilt: -11.36, zoom: 219 },
    // modified: 2025-11-30T18:56:13.336Z
  },
  switchden: {
    description: "Switch Den",
    image: switchden,
    position: { pan: 36.6, tilt: -5.64, zoom: 842 },
    // modified: 2025-10-09T11:10:30.172Z
  },
  switchgatel: {
    description: "switchgatel",
    image: switchgatel,
    position: { pan: 11.71, tilt: -16.17, zoom: 611 },
    // modified: 2026-01-24T18:54:34.223Z
  },
  switchgater: {
    description: "Switch Gate Right",
    image: switchgater,
    position: { pan: 42.55, tilt: -7.38, zoom: 1782 },
    // modified: 2025-10-09T11:10:30.192Z
  },
  switchpen: {
    description: "Switch Pen",
    image: switchpen,
    position: { pan: 22.83, tilt: -14.24, zoom: 1 },
    // modified: 2025-10-09T11:10:30.176Z
  },
  switchpenl: {
    description: "Switch Pen Left",
    image: switchpenl,
    position: { pan: -6.19, tilt: -12.89, zoom: 1 },
    // modified: 2025-10-09T11:10:30.172Z
  },
  switchpenr: {
    description: "Switch Pen Right",
    image: switchpenr,
    position: { pan: 36.38, tilt: -5.85, zoom: 348 },
    // modified: 2025-10-09T11:10:30.176Z
  },
  switchramp: {
    description: "Switch Ramp",
    image: switchramp,
    position: { pan: 33.25, tilt: -6.48, zoom: 5970 },
    // modified: 2025-10-09T11:10:30.172Z
  },
  tip: {
    description: "Tip",
    image: tip,
    position: { pan: 108.07, tilt: -8.85, zoom: 415 },
    // modified: 2025-10-09T11:10:30.192Z
  },
  tipmo: {
    description: "Tip zoomed",
    image: tipmo,
    position: { pan: 114.38, tilt: -7.63, zoom: 4843 },
    // modified: 2025-10-09T11:10:30.172Z
  },
  trees: {
    description: "middle trees",
    image: trees,
    position: { pan: 139.31, tilt: -1.91, zoom: 1997 },
    // modified: 2025-11-30T18:56:13.336Z
  },
  waterfall: {
    description: "Waterfall",
    image: waterfall,
    position: { pan: 86.58, tilt: -13.41, zoom: 1321 },
    // modified: 2025-10-09T11:10:30.192Z
  },
  wolfcornercam: {
    description: "Wolf Corner Cam",
    image: wolfcornercam,
    position: { pan: 149.7, tilt: 3.16, zoom: 3298 },
    // modified: 2025-10-09T11:10:30.192Z
  },
};

const wolf = {
  title: "Wolf",
  group: "wolf",
  presets: wolfPresets,
};

export default wolf;
