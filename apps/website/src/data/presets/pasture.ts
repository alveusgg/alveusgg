import angel from "@/assets/presets/pasture/angel.png";
import barn2 from "@/assets/presets/pasture/barn2.png";
import barn2hay from "@/assets/presets/pasture/barn2hay.png";
import barn2r from "@/assets/presets/pasture/barn2r.png";
import barn2w from "@/assets/presets/pasture/barn2w.png";
import barn2z from "@/assets/presets/pasture/barn2z.png";
import barn from "@/assets/presets/pasture/barn.png";
import barnfloor from "@/assets/presets/pasture/barnfloor.png";
import brush from "@/assets/presets/pasture/brush.png";
import brushl from "@/assets/presets/pasture/brushl.png";
import brushr from "@/assets/presets/pasture/brushr.png";
import donksleep from "@/assets/presets/pasture/donksleep.png";
import down from "@/assets/presets/pasture/down.png";
import downleft from "@/assets/presets/pasture/downleft.png";
import feeder from "@/assets/presets/pasture/feeder.png";
import feederstatus from "@/assets/presets/pasture/feederstatus.png";
import feedstall from "@/assets/presets/pasture/feedstall.png";
import fencel from "@/assets/presets/pasture/fencel.png";
import gate from "@/assets/presets/pasture/gate.png";
import ground from "@/assets/presets/pasture/ground.png";
import groundr from "@/assets/presets/pasture/groundr.png";
import grove2 from "@/assets/presets/pasture/grove2.png";
import grove2l from "@/assets/presets/pasture/grove2l.png";
import grove2r from "@/assets/presets/pasture/grove2r.png";
import grove3 from "@/assets/presets/pasture/grove3.png";
import grove3l from "@/assets/presets/pasture/grove3l.png";
import grove from "@/assets/presets/pasture/grove.png";
import grovefl from "@/assets/presets/pasture/grovefl.png";
import grovel from "@/assets/presets/pasture/grovel.png";
import grover from "@/assets/presets/pasture/grover.png";
import home from "@/assets/presets/pasture/home.png";
import insidebarn from "@/assets/presets/pasture/insidebarn.png";
import insidebarnz from "@/assets/presets/pasture/insidebarnz.png";
import middle from "@/assets/presets/pasture/middle.png";
import pen from "@/assets/presets/pasture/pen.png";
import penl from "@/assets/presets/pasture/penl.png";
import penr from "@/assets/presets/pasture/penr.png";
import pole from "@/assets/presets/pasture/pole.png";
import pool from "@/assets/presets/pasture/pool.png";
import pooll from "@/assets/presets/pasture/pooll.png";
import poolr from "@/assets/presets/pasture/poolr.png";
import purplebase from "@/assets/presets/pasture/purplebase.png";
import purplebasel from "@/assets/presets/pasture/purplebasel.png";
import purplebaser from "@/assets/presets/pasture/purplebaser.png";
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
    position: { pan: -6.5, tilt: -8.79, zoom: 1 },
    // modified: 2025-12-18T21:22:43.553Z
  },
  angel: {
    description: "winnies begging spot",
    image: angel,
    position: { pan: 46.68, tilt: -17.02, zoom: 1211 },
    // modified: 2025-11-22T20:20:39.730Z
  },
  barn: {
    description: "front of main structure",
    image: barn,
    position: { pan: 34.43, tilt: -7.85, zoom: 1 },
    // modified: 2025-10-09T11:10:30.088Z
  },
  barn2: {
    description: "secondary barn/structure",
    image: barn2,
    position: { pan: -26.69, tilt: -6.31, zoom: 2709 },
    // modified: 2025-10-09T11:10:30.088Z
  },
  barn2hay: {
    description: "Barn 2 hay spot",
    image: barn2hay,
    position: { pan: -24.34, tilt: -6.59, zoom: 3209 },
    // modified: 2025-10-09T11:10:30.088Z
  },
  barn2r: {
    description: "Barn 2 right",
    image: barn2r,
    position: { pan: -22.43, tilt: -5.25, zoom: 2411 },
    // modified: 2025-10-09T11:10:30.088Z
  },
  barn2w: {
    description: "Barn 2 wide",
    image: barn2w,
    position: { pan: -24.25, tilt: -6.33, zoom: 1910 },
    // modified: 2025-11-20T23:26:26.452Z
  },
  barn2z: {
    description: "Barn 2 zoomed",
    image: barn2z,
    position: { pan: -27.99, tilt: -6.89, zoom: 5094 },
    // modified: 2025-10-09T11:10:30.084Z
  },
  barnfloor: {
    description: "Barn Floor",
    image: barnfloor,
    position: { pan: 99.51, tilt: -52.83, zoom: 1 },
    // modified: 2025-10-09T11:10:30.088Z
  },
  brush: {
    description: "Squitchy",
    image: brush,
    position: { pan: -7.24, tilt: -7.45, zoom: 1798 },
    // modified: 2025-10-09T11:10:30.088Z
  },
  brushl: {
    description: "brushl",
    image: brushl,
    position: { pan: -15.36, tilt: -7.34, zoom: 530 },
    // modified: 2026-01-03T20:31:53.192Z
  },
  brushr: {
    description: "Brush right",
    image: brushr,
    position: { pan: -2.76, tilt: -7.45, zoom: 2296 },
    // modified: 2025-10-09T11:10:30.088Z
  },
  donksleep: {
    description: "donks sleep spot in the pen",
    image: donksleep,
    position: { pan: 17.63, tilt: -5.08, zoom: 4037 },
    // modified: 2025-10-09T11:10:30.092Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -37.95, tilt: -62.14, zoom: 1 },
    // modified: 2025-10-09T11:10:30.084Z
  },
  downleft: {
    description: "downleft",
    image: downleft,
    position: { pan: 83.89, tilt: -6.61, zoom: 2183 },
    // modified: 2025-11-18T17:55:38.827Z
  },
  feeder: {
    description: "Feeder",
    image: feeder,
    position: { pan: 63.85, tilt: -12.46, zoom: 1 },
    // modified: 2025-10-09T11:10:30.092Z
  },
  feederstatus: {
    description: "Feeder status window",
    image: feederstatus,
    position: { pan: 74.91, tilt: -5.02, zoom: 9392 },
    // modified: 2025-10-09T11:10:30.084Z
  },
  feedstall: {
    description: "Feed Stall",
    image: feedstall,
    position: { pan: 89.55, tilt: -37.97, zoom: 1 },
    // modified: 2025-10-09T11:10:30.092Z
  },
  fencel: {
    description: "Fence Left",
    image: fencel,
    position: { pan: -26.7, tilt: -11.16, zoom: 1812 },
    // modified: 2025-10-09T11:10:30.092Z
  },
  gate: {
    description: "Gate",
    image: gate,
    position: { pan: 61.6, tilt: -31.9, zoom: 1 },
    // modified: 2025-10-09T11:10:30.096Z
  },
  ground: {
    description: "Ground near cam",
    image: ground,
    position: { pan: -8.4, tilt: -31.45, zoom: 1 },
    // modified: 2025-11-30T18:57:16.633Z
  },
  groundr: {
    description: "Ground Right",
    image: groundr,
    position: { pan: 21.15, tilt: -26.41, zoom: 1 },
    // modified: 2025-11-30T18:57:16.633Z
  },
  grove: {
    description: "grove of trees near barn 2",
    image: grove,
    position: { pan: -15.8, tilt: -5.27, zoom: 2098 },
    // modified: 2025-12-03T15:02:46.490Z
  },
  grove2: {
    description: "grove of trees near roundpen",
    image: grove2,
    position: { pan: 6.96, tilt: -4.71, zoom: 2431 },
    // modified: 2025-11-18T17:36:44.065Z
  },
  grove2l: {
    description: "Grove 2 Left",
    image: grove2l,
    position: { pan: 3.1, tilt: -4.73, zoom: 2312 },
    // modified: 2025-11-30T18:57:16.637Z
  },
  grove2r: {
    description: "Grove 2 Right",
    image: grove2r,
    position: { pan: 10.47, tilt: -4.44, zoom: 2431 },
    // modified: 2025-10-09T11:10:30.084Z
  },
  grove3: {
    description: "grove3",
    image: grove3,
    position: { pan: 36.45, tilt: -2.64, zoom: 2955 },
    // modified: 2025-10-18T14:39:40.510Z
  },
  grove3l: {
    description: "grove3l",
    image: grove3l,
    position: { pan: 29.29, tilt: -3.11, zoom: 2278 },
    // modified: 2026-01-03T20:11:34.212Z
  },
  grovefl: {
    description: "Grove Front Left",
    image: grovefl,
    position: { pan: -20.42, tilt: -6.85, zoom: 3039 },
    // modified: 2025-10-09T11:10:30.084Z
  },
  grovel: {
    description: "Grove Left",
    image: grovel,
    position: { pan: -18.5, tilt: -5.46, zoom: 2411 },
    // modified: 2025-10-09T11:10:30.084Z
  },
  grover: {
    description: "grover",
    image: grover,
    position: { pan: -11.95, tilt: -5.48, zoom: 1851 },
    // modified: 2026-01-03T20:40:36.816Z
  },
  insidebarn: {
    description: "Inside Barn",
    image: insidebarn,
    position: { pan: 79.52, tilt: -7.27, zoom: 1 },
    // modified: 2025-10-09T11:10:30.096Z
  },
  insidebarnz: {
    description: "insidebarnz",
    image: insidebarnz,
    position: { pan: 83.87, tilt: -6.62, zoom: 2181 },
    // modified: 2025-11-18T17:56:26.112Z
  },
  middle: {
    description: "Middle",
    image: middle,
    position: { pan: 5.23, tilt: -7.32, zoom: 1376 },
    // modified: 2025-11-18T17:28:32.465Z
  },
  pen: {
    description: "Pen",
    image: pen,
    position: { pan: 20.62, tilt: -3.61, zoom: 1739 },
    // modified: 2025-11-12T14:02:16.520Z
  },
  penl: {
    description: "Pen Left",
    image: penl,
    position: { pan: 13.69, tilt: -4.3, zoom: 2223 },
    // modified: 2025-11-18T17:34:09.378Z
  },
  penr: {
    description: "Pen Right",
    image: penr,
    position: { pan: 26.73, tilt: -3.76, zoom: 2223 },
    // modified: 2025-11-18T17:34:53.883Z
  },
  pole: {
    description: "Pole",
    image: pole,
    position: { pan: 25.74, tilt: -1.74, zoom: 1923 },
    // modified: 2025-10-09T11:10:30.100Z
  },
  pool: {
    description: "stompys pool",
    image: pool,
    position: { pan: 42.69, tilt: -1.94, zoom: 2116 },
    // modified: 2025-11-18T17:30:17.114Z
  },
  pooll: {
    description: "Pool Left",
    image: pooll,
    position: { pan: 32.52, tilt: -3.24, zoom: 2272 },
    // modified: 2025-11-18T17:32:45.969Z
  },
  poolr: {
    description: "Pool Right",
    image: poolr,
    position: { pan: 52.85, tilt: -1.25, zoom: 2029 },
    // modified: 2025-11-18T17:32:02.136Z
  },
  purplebase: {
    description: "Purple Martin Base",
    image: purplebase,
    position: { pan: -1.3, tilt: -4.83, zoom: 2313 },
    // modified: 2025-10-09T11:10:30.100Z
  },
  purplebasel: {
    description: "Purple Martin Base Left",
    image: purplebasel,
    position: { pan: -3.35, tilt: -4.53, zoom: 2312 },
    // modified: 2025-11-30T18:57:16.637Z
  },
  purplebaser: {
    description: "purplebaser",
    image: purplebaser,
    position: { pan: 1.22, tilt: -4.58, zoom: 1019 },
    // modified: 2026-01-21T13:42:32.709Z
  },
  purplenest: {
    description: "Purple Martin Nest",
    image: purplenest,
    position: { pan: -1.58, tilt: -1.58, zoom: 8835 },
    // modified: 2025-10-09T11:10:30.100Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 56.07, tilt: -1.23, zoom: 2229 },
    // modified: 2025-11-18T17:31:19.567Z
  },
  roundpen: {
    description: "Round Pen",
    image: roundpen,
    position: { pan: 20.97, tilt: -3.24, zoom: 1669 },
    // modified: 2025-10-09T11:10:30.100Z
  },
  saltlick: {
    description: "Salt Lick",
    image: saltlick,
    position: { pan: -24.56, tilt: -5.58, zoom: 99911 },
    // modified: 2025-12-04T15:37:59.905Z
  },
  sky: {
    description: "Sky",
    image: sky,
    position: { pan: 0.13, tilt: 6.15, zoom: 1 },
    // modified: 2025-10-09T11:10:30.104Z
  },
  stompyfood: {
    description: "Stompy Food",
    image: stompyfood,
    position: { pan: 95.1, tilt: -9.25, zoom: 1514 },
    // modified: 2025-10-09T11:10:30.104Z
  },
  sunrise: {
    description: "Sunrise",
    image: sunrise,
    position: { pan: -6.51, tilt: 1.19, zoom: 1 },
    // modified: 2025-10-09T11:10:30.104Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: 59.43, tilt: -2.62, zoom: 1815 },
    // modified: 2025-10-09T11:10:30.104Z
  },
};

const pasture = {
  title: "Pasture",
  group: "pasture",
  presets: pasturePresets,
};

export default pasture;
