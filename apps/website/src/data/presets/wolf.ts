import { type StaticImageData } from "next/image";

import backleftcorner from "@/assets/presets/wolf/backleftcorner.png";
import belowplatform from "@/assets/presets/wolf/belowplatform.png";
import bigrocks from "@/assets/presets/wolf/bigrocks.png";
import center from "@/assets/presets/wolf/center.png";
import den1 from "@/assets/presets/wolf/den1.png";
import den1inside from "@/assets/presets/wolf/den1inside.png";
import den1l from "@/assets/presets/wolf/den1l.png";
import den1r from "@/assets/presets/wolf/den1r.png";
import den1t from "@/assets/presets/wolf/den1t.png";
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
import pond from "@/assets/presets/wolf/pond.png";
import right from "@/assets/presets/wolf/right.png";
import rightfence from "@/assets/presets/wolf/rightfence.png";
import river from "@/assets/presets/wolf/river.png";
import switchgater from "@/assets/presets/wolf/switchgater.png";
import tip from "@/assets/presets/wolf/tip.png";
import waterfall from "@/assets/presets/wolf/waterfall.png";
import wolfcornercam from "@/assets/presets/wolf/wolfcornercam.png";

// import log from "@/assets/presets/wolf/log.png";
// import neargrass from "@/assets/presets/wolf/neargrass.png";
// import shaft from "@/assets/presets/wolf/shaft.png";
// import switchden from "@/assets/presets/wolf/switchden.png";
// import switchpen from "@/assets/presets/wolf/switchpen.png";
// import switchpenl from "@/assets/presets/wolf/switchpenl.png";
// import switchpenr from "@/assets/presets/wolf/switchpenr.png";
// import switchramp from "@/assets/presets/wolf/switchramp.png";
// import tipmo from "@/assets/presets/wolf/tipmo.png";
// import akelafood from "@/assets/presets/wolf/akelafood.png";
// import den1tz from "@/assets/presets/wolf/den1tz.png";
// import trees from "@/assets/presets/wolf/trees.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const wolfPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  den1: {
    description: "Den 1",
    image: den1,
  },
  den1l: {
    description: "Den 1 (left)",
    image: den1l,
  },
  den1r: {
    description: "Den 1 (right)",
    image: den1r,
  },
  den1t: {
    description: "Den 1 (top)",
    image: den1t,
  },
  den1inside: {
    description: "Den 1 (inside)",
    image: den1inside,
  },
  den2: {
    description: "Den 2",
    image: den2,
  },
  den2b: {
    description: "Den 2 (bottom)",
    image: den2b,
  },
  den2gap: {
    description: "Den 2 (gap)",
    image: den2gap,
  },
  den2l: {
    description: "Den 2 (left)",
    image: den2l,
  },
  den2m: {
    description: "Den 2 (middle)",
    image: den2m,
  },
  den2mz: {
    description: "Den 2 (middle z)",
    image: den2mz,
  },
  den2r: {
    description: "Den 2 (right)",
    image: den2r,
  },
  den2t: {
    description: "Den 2 (top)",
    image: den2t,
  },
  den2w: {
    description: "Den 2 (wall)",
    image: den2w,
  },
  den2rw: {
    description: "Den 2 (right wall)",
    image: den2rw,
  },
  backleftcorner: {
    description: "Back Left Corner",
    image: backleftcorner,
  },
  belowplatform: {
    description: "Below Platform",
    image: belowplatform,
  },
  bigrocks: {
    description: "Big Rocks",
    image: bigrocks,
  },
  center: {
    description: "Center",
    image: center,
  },
  down: {
    description: "Down",
    image: down,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  farcorner: {
    description: "Far Corner",
    image: farcorner,
  },
  farfence: {
    description: "Far Fence",
    image: farfence,
  },
  grass: {
    description: "Grass",
    image: grass,
  },
  grassl: {
    description: "Grass (left)",
    image: grassl,
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
  pond: {
    description: "Pond",
    image: pond,
  },
  right: {
    description: "Right",
    image: right,
  },
  rightfence: {
    description: "Right Fence",
    image: rightfence,
  },
  river: {
    description: "River",
    image: river,
  },
  switchgater: {
    description: "Switch Gate Right",
    image: switchgater,
  },
  tip: {
    description: "Tip",
    image: tip,
  },
  waterfall: {
    description: "Waterfall",
    image: waterfall,
  },
  wolfcornercam: {
    description: "Wolf Corner Cam",
    image: wolfcornercam,
  },
  log: {
    description: "Log",
    //image: log,
  },
  neargrass: {
    description: "Near Grass",
    //image: neargrass,
  },
  shaft: {
    description: "Shaft",
    //image: shaft,
  },
  switchden: {
    description: "Switch Den",
    //image: switchden,
  },
  switchpen: {
    description: "Switch Pen",
    //image: switchpen,
  },
  switchpenl: {
    description: "Switch Pen Left",
    //image: switchpenl,
  },
  switchpenr: {
    description: "Switch Pen Right",
    //image: switchpenr,
  },
  switchramp: {
    description: "Switch Ramp",
    //image: switchramp,
  },
  tipmo: {
    description: "Tip (mo)",
    //image: tipmo,
  },
  akelafood: {
    description: "Akela Food",
    //image: akelafood,
  },
  den1tz: {
    description: "Den 1 (tz)",
    //image: den1tz,
  },
  trees: {
    description: "Trees",
    //image: trees,
  },
};

const wolf = {
  title: "Wolf",
  presets: wolfPresets,
};

export default wolf;
