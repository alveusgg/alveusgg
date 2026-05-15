import cratef from "@/assets/presets/serval/cratef.png";
import cratel from "@/assets/presets/serval/cratel.png";
import door from "@/assets/presets/serval/door.png";
import down from "@/assets/presets/serval/down.png";
import home from "@/assets/presets/serval/home.png";
import insidecrate from "@/assets/presets/serval/insidecrate.png";
import left from "@/assets/presets/serval/left.png";
import leftplatform from "@/assets/presets/serval/leftplatform.png";
import leftplatformb from "@/assets/presets/serval/leftplatformb.png";
import leftplatformf from "@/assets/presets/serval/leftplatformf.png";
import leftwide from "@/assets/presets/serval/leftwide.png";
import log from "@/assets/presets/serval/log.png";
import middleplatform from "@/assets/presets/serval/middleplatform.png";
import middleplatformt from "@/assets/presets/serval/middleplatformt.png";
import middleplatformtl from "@/assets/presets/serval/middleplatformtl.png";
import middleplatformtr from "@/assets/presets/serval/middleplatformtr.png";
import rightplatform from "@/assets/presets/serval/rightplatform.png";
import rightplatformb from "@/assets/presets/serval/rightplatformb.png";
import rightwide from "@/assets/presets/serval/rightwide.png";
import sand from "@/assets/presets/serval/sand.png";
import tub from "@/assets/presets/serval/tub.png";
import tubb from "@/assets/presets/serval/tubb.png";
import waterl from "@/assets/presets/serval/waterl.png";
import waterr from "@/assets/presets/serval/waterr.png";
import wide from "@/assets/presets/serval/wide.png";

import type { Preset } from "../tech/cameras.types";

const servalPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -88.51, tilt: -18.05, zoom: 1 },
    // modified: 2026-04-02T12:27:39.327Z
  },
  cratef: {
    description: "cratef",
    image: cratef,
    position: { pan: -61.22, tilt: -38.17, zoom: 1 },
    // modified: 2026-05-07T14:52:00.462Z
  },
  cratel: {
    description: "cratel",
    image: cratel,
    position: { pan: -78.53, tilt: -48.16, zoom: 212 },
    // modified: 2026-04-08T14:54:41.283Z
  },
  door: {
    description: "door",
    image: door,
    position: { pan: -110.89, tilt: -77.69, zoom: 1 },
    // modified: 2026-04-02T12:38:24.129Z
  },
  down: {
    description: "down",
    image: down,
    position: { pan: -100.71, tilt: -51.55, zoom: 1 },
    // modified: 2026-04-02T12:33:29.949Z
  },
  insidecrate: {
    description: "insidecrate",
    image: insidecrate,
    position: { pan: -63.96, tilt: -57.51, zoom: 3174 },
    // modified: 2026-05-12T19:48:50.588Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -117.61, tilt: -37.76, zoom: 1 },
    // modified: 2026-04-02T12:34:22.994Z
  },
  leftplatform: {
    description: "leftplatform",
    image: leftplatform,
    position: { pan: -143.16, tilt: -20.28, zoom: 577 },
    // modified: 2026-04-26T14:37:07.296Z
  },
  leftplatformb: {
    description: "leftplatformb",
    image: leftplatformb,
    position: { pan: -144.16, tilt: -31.46, zoom: 1529 },
    // modified: 2026-04-08T14:49:40.363Z
  },
  leftplatformf: {
    description: "leftplatformf",
    image: leftplatformf,
    position: { pan: -148.46, tilt: -20.61, zoom: 1255 },
    // modified: 2026-04-26T14:38:58.746Z
  },
  leftwide: {
    description: "leftwide",
    image: leftwide,
    position: { pan: -119.98, tilt: -27.14, zoom: 1 },
    // modified: 2026-04-02T12:30:25.942Z
  },
  log: {
    description: "log",
    image: log,
    position: { pan: -94.06, tilt: -45.43, zoom: 1 },
    // modified: 2026-04-03T16:39:53.718Z
  },
  middleplatform: {
    description: "middleplatform",
    image: middleplatform,
    position: { pan: -100.79, tilt: -24.79, zoom: 395 },
    // modified: 2026-04-02T12:37:39.728Z
  },
  middleplatformt: {
    description: "middleplatformt",
    image: middleplatformt,
    position: { pan: -92.63, tilt: -8.82, zoom: 395 },
    // modified: 2026-04-02T12:36:52.240Z
  },
  middleplatformtl: {
    description: "middleplatformtl",
    image: middleplatformtl,
    position: { pan: -103.13, tilt: -7.61, zoom: 395 },
    // modified: 2026-04-08T14:51:46.501Z
  },
  middleplatformtr: {
    description: "middleplatformtr",
    image: middleplatformtr,
    position: { pan: -84.96, tilt: -8.26, zoom: 395 },
    // modified: 2026-04-08T14:53:06.034Z
  },
  rightplatform: {
    description: "rightplatform",
    image: rightplatform,
    position: { pan: -61.93, tilt: -18.73, zoom: 1001 },
    // modified: 2026-04-02T12:32:44.600Z
  },
  rightplatformb: {
    description: "rightplatformb",
    image: rightplatformb,
    position: { pan: -59, tilt: -25.22, zoom: 916 },
    // modified: 2026-04-03T16:39:24.997Z
  },
  rightwide: {
    description: "rightwide",
    image: rightwide,
    position: { pan: -81.23, tilt: -26.66, zoom: 1 },
    // modified: 2026-04-02T12:29:55.145Z
  },
  sand: {
    description: "sand",
    image: sand,
    position: { pan: -94.53, tilt: -19.93, zoom: 1001 },
    // modified: 2026-04-02T12:28:16.700Z
  },
  tub: {
    description: "tub",
    image: tub,
    position: { pan: -141.53, tilt: -43.78, zoom: 89 },
    // modified: 2026-04-03T16:40:45.015Z
  },
  tubb: {
    description: "tubb",
    image: tubb,
    position: { pan: -143.88, tilt: -59.94, zoom: 1 },
    // modified: 2026-05-12T22:00:13.110Z
  },
  waterl: {
    description: "waterl",
    image: waterl,
    position: { pan: -112.61, tilt: -23.28, zoom: 628 },
    // modified: 2026-05-07T14:48:34.453Z
  },
  waterr: {
    description: "waterr",
    image: waterr,
    position: { pan: -73.31, tilt: -21.83, zoom: 628 },
    // modified: 2026-05-07T14:49:48.287Z
  },
  wide: {
    description: "wide",
    image: wide,
    position: { pan: -90.01, tilt: -32.42, zoom: 1 },
    // modified: 2026-05-07T14:51:04.549Z
  },
};

const serval = {
  title: "Serval",
  group: "serval",
  presets: servalPresets,
};

export default serval;
