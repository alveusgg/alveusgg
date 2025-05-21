import { type StaticImageData } from "next/image";

import angel from "@/assets/presets/pasture/angel.png";
import barn2 from "@/assets/presets/pasture/barn2.png";
import barn2r from "@/assets/presets/pasture/barn2r.png";
import barn from "@/assets/presets/pasture/barn.png";
import barnfloor from "@/assets/presets/pasture/barnfloor.png";
import brush from "@/assets/presets/pasture/brush.png";
import brushr from "@/assets/presets/pasture/brushr.png";
import donksleep from "@/assets/presets/pasture/donksleep.png";
import feeder from "@/assets/presets/pasture/feeder.png";
import feedstall from "@/assets/presets/pasture/feedstall.png";
import fencel from "@/assets/presets/pasture/fencel.png";
import gate from "@/assets/presets/pasture/gate.png";
import grove from "@/assets/presets/pasture/grove.png";
import insidebarn from "@/assets/presets/pasture/insidebarn.png";
import middle from "@/assets/presets/pasture/middle.png";
import pen from "@/assets/presets/pasture/pen.png";
import penl from "@/assets/presets/pasture/penl.png";
import penr from "@/assets/presets/pasture/penr.png";
import pooll from "@/assets/presets/pasture/pooll.png";
import poolr from "@/assets/presets/pasture/poolr.png";
import purplebase from "@/assets/presets/pasture/purplebase.png";
import purplenest from "@/assets/presets/pasture/purplenest.png";
import right from "@/assets/presets/pasture/right.png";
import roundpen from "@/assets/presets/pasture/roundpen.png";
import saltlick from "@/assets/presets/pasture/saltlick.png";
import sky from "@/assets/presets/pasture/sky.png";
import stompyfood from "@/assets/presets/pasture/stompyfood.png";
import sunrise from "@/assets/presets/pasture/sunrise.png";
import water from "@/assets/presets/pasture/water.png";

export interface Preset {
  description: string;
  image: StaticImageData;
}

const pasturePresets: Record<string, Preset> = {
  angel: {
    description: "winnies begging spot",
    image: angel,
  },
  barn: {
    description: "Barn",
    image: barn,
  },
  barn2: {
    description: "Barn 2",
    image: barn2,
  },
  barn2r: {
    description: "Barn 2 (right)",
    image: barn2r,
  },
  barnfloor: {
    description: "Barn Floor",
    image: barnfloor,
  },
  brush: {
    description: "Brush",
    image: brush,
  },
  brushr: {
    description: "Brush (right)",
    image: brushr,
  },
  donksleep: {
    description: "Donk Sleep",
    image: donksleep,
  },
  feeder: {
    description: "Feeder",
    image: feeder,
  },
  feedstall: {
    description: "Feed Stall",
    image: feedstall,
  },
  fencel: {
    description: "Fence Left",
    image: fencel,
  },
  gate: {
    description: "Gate",
    image: gate,
  },
  grove: {
    description: "Grove",
    image: grove,
  },
  insidebarn: {
    description: "Inside Barn",
    image: insidebarn,
  },
  middle: {
    description: "Middle",
    image: middle,
  },
  pen: {
    description: "Pen",
    image: pen,
  },
  penl: {
    description: "Pen Left",
    image: penl,
  },
  penr: {
    description: "Pen Right",
    image: penr,
  },
  pooll: {
    description: "Pool Left",
    image: pooll,
  },
  poolr: {
    description: "Pool Right",
    image: poolr,
  },
  purplebase: {
    description: "Purple Base",
    image: purplebase,
  },
  purplenest: {
    description: "Purple Nest",
    image: purplenest,
  },
  right: {
    description: "Right",
    image: right,
  },
  roundpen: {
    description: "Round Pen",
    image: roundpen,
  },
  saltlick: {
    description: "Salt Lick",
    image: saltlick,
  },
  sky: {
    description: "Sky",
    image: sky,
  },
  stompyfood: {
    description: "Stompy Food",
    image: stompyfood,
  },
  sunrise: {
    description: "Sunrise",
    image: sunrise,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const pasture = {
  title: "Pasture",
  presets: pasturePresets,
};

export default pasture;
