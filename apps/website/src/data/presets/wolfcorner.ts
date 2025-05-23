import { type StaticImageData } from "next/image";

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
import den2shade from "@/assets/presets/wolfcorner/den2shade.png";
import den2t from "@/assets/presets/wolfcorner/den2t.png";
import down from "@/assets/presets/wolfcorner/down.png";
import downleft from "@/assets/presets/wolfcorner/downleft.png";
import downright from "@/assets/presets/wolfcorner/downright.png";
import grass from "@/assets/presets/wolfcorner/grass.png";
import grassr from "@/assets/presets/wolfcorner/grassr.png";
import home from "@/assets/presets/wolfcorner/home.png";
import left from "@/assets/presets/wolfcorner/left.png";
import leftcorner from "@/assets/presets/wolfcorner/leftcorner.png";
import leftfence from "@/assets/presets/wolfcorner/leftfence.png";
import leftw from "@/assets/presets/wolfcorner/leftw.png";
import nearcorner from "@/assets/presets/wolfcorner/nearcorner.png";
import rampl from "@/assets/presets/wolfcorner/rampl.png";
import rampr from "@/assets/presets/wolfcorner/rampr.png";
import right from "@/assets/presets/wolfcorner/right.png";
import rightcorner from "@/assets/presets/wolfcorner/rightcorner.png";
import rightfence from "@/assets/presets/wolfcorner/rightfence.png";
import river from "@/assets/presets/wolfcorner/river.png";
import water from "@/assets/presets/wolfcorner/water.png";
import wolfcam from "@/assets/presets/wolfcorner/wolfcam.png";

// import grassl from "@/assets/presets/wolfcorner/grassl.png";
// import leftcornerw from "@/assets/presets/wolfcorner/leftcornerw.png";
// import switchpen from "@/assets/presets/wolfcorner/switchpen.png";
// import back from "@/assets/presets/wolfcorner/back.png";
// import trees from "@/assets/presets/wolfcorner/trees.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const wolfcornerPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  den2: {
    description: "Den 2",
    image: den2,
  },
  den2b: {
    description: "Den 2 (b)",
    image: den2b,
  },
  den2l: {
    description: "Den 2 (left)",
    image: den2l,
  },
  den2m: {
    description: "Den 2 (middle)",
    image: den2m,
  },
  den2t: {
    description: "Den 2 (top)",
    image: den2t,
  },
  den2shade: {
    description: "Den 2 (shade)",
    image: den2shade,
  },
  den2entrance: {
    description: "Den 2 (entrance)",
    image: den2entrance,
  },
  den2inside: {
    description: "Den 2 (inside)",
    image: den2inside,
  },
  den2door: {
    description: "Den 2 (door)",
    image: den2door,
  },
  den1: {
    description: "Den 1",
    image: den1,
  },
  belowrampl: {
    description: "Below Ramp (left)",
    image: belowrampl,
  },
  belowrampr: {
    description: "Below Ramp (right)",
    image: belowrampr,
  },
  belowramplz: {
    description: "Below Ramp (left, zoomed)",
    image: belowramplz,
  },
  belowplatform: {
    description: "Below Platform",
    image: belowplatform,
  },
  belowplatforml: {
    description: "Below Platform (left)",
    image: belowplatforml,
  },
  belowplatformr: {
    description: "Below Platform (right)",
    image: belowplatformr,
  },
  backfence: {
    description: "Back Fence",
    image: backfence,
  },
  leftfence: {
    description: "Left Fence",
    image: leftfence,
  },
  rightfence: {
    description: "Right Fence",
    image: rightfence,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftw: {
    description: "Left (water)",
    image: leftw,
  },
  right: {
    description: "Right",
    image: right,
  },
  rightw: {
    description: "Right (water)",
    image: right,
  },
  nearcorner: {
    description: "Near Corner",
    image: nearcorner,
  },
  rampl: {
    description: "Ramp (left)",
    image: rampl,
  },
  rampr: {
    description: "Ramp (right)",
    image: rampr,
  },
  down: {
    description: "Down",
    image: down,
  },
  downleft: {
    description: "Down (left)",
    image: downleft,
  },
  downright: {
    description: "Down (right)",
    image: downright,
  },
  grass: {
    description: "Grass",
    image: grass,
  },
  grassr: {
    description: "Grass (right)",
    image: grassr,
  },
  brushl: {
    description: "Brush (left)",
    image: brushl,
  },
  center: {
    description: "Center",
    image: center,
  },
  wolfcam: {
    description: "Wolf Cam",
    image: wolfcam,
  },
  river: {
    description: "River",
    image: river,
  },
  water: {
    description: "Water",
    image: water,
  },
  trees: {
    description: "Trees",
    //image: trees,
  },
  back: {
    description: "Back",
    //image: back,
  },
  switchpen: {
    description: "Switch Pen",
    //image: switchpen,
  },
  leftcornerw: {
    description: "Left Corner (water)",
    //image: leftcornerw,
  },
  grassl: {
    description: "Grass (left)",
    //image: grassl,
  },
};

const wolfcorner = {
  title: "Wolf Corner",
  presets: wolfcornerPresets,
};

export default wolfcorner;
