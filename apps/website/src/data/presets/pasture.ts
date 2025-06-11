import angel from "@/assets/presets/pasture/angel.png";
import barn2 from "@/assets/presets/pasture/barn2.png";
import barn2hay from "@/assets/presets/pasture/barn2hay.png";
import barn2r from "@/assets/presets/pasture/barn2r.png";
import barn from "@/assets/presets/pasture/barn.png";
import barnfloor from "@/assets/presets/pasture/barnfloor.png";
import brush from "@/assets/presets/pasture/brush.png";
import brushr from "@/assets/presets/pasture/brushr.png";
import donksleep from "@/assets/presets/pasture/donksleep.png";
import down from "@/assets/presets/pasture/down.png";
import feeder from "@/assets/presets/pasture/feeder.png";
import feederstatus from "@/assets/presets/pasture/feederstatus.png";
import feedstall from "@/assets/presets/pasture/feedstall.png";
import fencel from "@/assets/presets/pasture/fencel.png";
import gate from "@/assets/presets/pasture/gate.png";
import ground from "@/assets/presets/pasture/ground.png";
import grove2 from "@/assets/presets/pasture/grove2.png";
import grove2l from "@/assets/presets/pasture/grove2l.png";
import grove from "@/assets/presets/pasture/grove.png";
import home from "@/assets/presets/pasture/home.png";
import insidebarn from "@/assets/presets/pasture/insidebarn.png";
import middle from "@/assets/presets/pasture/middle.png";
import pedrocorner from "@/assets/presets/pasture/pedrocorner.png";
import pen from "@/assets/presets/pasture/pen.png";
import penl from "@/assets/presets/pasture/penl.png";
import penr from "@/assets/presets/pasture/penr.png";
import pole from "@/assets/presets/pasture/pole.png";
import pool from "@/assets/presets/pasture/pool.png";
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

import type { Preset } from "../tech/cameras.types";

const pasturePresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  angel: {
    description: "winnies begging spot",
    image: angel,
  },
  barn: {
    description: "front of main structure",
    image: barn,
  },
  barn2: {
    description: "secondary barn/structure",
    image: barn2,
  },
  barn2hay: {
    description: "Barn 2 hay spot",
    image: barn2hay,
  },
  barn2r: {
    description: "Barn 2 right",
    image: barn2r,
  },
  barnfloor: {
    description: "Barn Floor",
    image: barnfloor,
  },
  brush: {
    description: "Squitchy",
    image: brush,
  },
  brushr: {
    description: "Brush right",
    image: brushr,
  },
  donksleep: {
    description: "donks sleep spot in the pen",
    image: donksleep,
  },
  down: {
    description: "Down",
    image: down,
  },
  feeder: {
    description: "Feeder",
    image: feeder,
  },
  feederstatus: {
    description: "Feeder status window",
    image: feederstatus,
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
    description: "grove of trees near barn 2",
    image: grove,
  },
  grove2: {
    description: "grove of trees near roundpen",
    image: grove2,
  },
  grove2l: {
    description: "Grove 2 Left",
    image: grove2l,
  },
  ground: {
    description: "Ground near cam",
    image: ground,
  },
  insidebarn: {
    description: "Inside Barn",
    image: insidebarn,
  },
  middle: {
    description: "Middle",
    image: middle,
  },
  pedrocorner: {
    description: "where pedro comes and goes",
    image: pedrocorner,
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
  pole: {
    description: "Pole",
    image: pole,
  },
  pool: {
    description: "stompys pool",
    image: pool,
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
    description: "Purple Martin Base",
    image: purplebase,
  },
  purplenest: {
    description: "Purple Martin Nest",
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
  group: "pasture",
  presets: pasturePresets,
};

export default pasture;
