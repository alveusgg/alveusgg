import crate from "@/assets/presets/servalindoor/crate.png";
import cratetop from "@/assets/presets/servalindoor/cratetop.png";
import cubby from "@/assets/presets/servalindoor/cubby.png";
import cubbyt from "@/assets/presets/servalindoor/cubbyt.png";
import down from "@/assets/presets/servalindoor/down.png";
import home from "@/assets/presets/servalindoor/home.png";
import left from "@/assets/presets/servalindoor/left.png";
import leftcorner from "@/assets/presets/servalindoor/leftcorner.png";
import leftdoor from "@/assets/presets/servalindoor/leftdoor.png";
import leftplatform from "@/assets/presets/servalindoor/leftplatform.png";
import leftplatformb from "@/assets/presets/servalindoor/leftplatformb.png";
import middle from "@/assets/presets/servalindoor/middle.png";
import topleft from "@/assets/presets/servalindoor/topleft.png";

import type { Preset } from "../tech/cameras.types";

const servalindoorPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -129, tilt: -25.41, zoom: 1 },
    // modified: 2026-09-10T21:32:57.145Z
  },
  crate: {
    description: "crate",
    image: crate,
    position: { pan: -107.05, tilt: -12.61, zoom: 2596 },
    // modified: 2026-09-11T13:20:23.463Z
  },
  cratetop: {
    description: "cratetop",
    image: cratetop,
    position: { pan: -106.47, tilt: -6.27, zoom: 1702 },
    // modified: 2026-09-12T12:54:14.089Z
  },
  cubby: {
    description: "cubby",
    image: cubby,
    position: { pan: -106.81, tilt: -21.01, zoom: 619 },
    // modified: 2026-09-10T21:33:30.591Z
  },
  cubbyt: {
    description: "cubbyt",
    image: cubbyt,
    position: { pan: -104.95, tilt: -12.58, zoom: 689 },
    // modified: 2026-09-10T22:11:01.857Z
  },
  down: {
    description: "down",
    image: down,
    position: { pan: -130.45, tilt: -76.26, zoom: 1 },
    // modified: 2026-09-10T22:28:06.770Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -165.29, tilt: -26.01, zoom: 1 },
    // modified: 2026-09-10T21:33:13.926Z
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
    position: { pan: 169.7, tilt: -30.23, zoom: 1 },
    // modified: 2026-09-10T22:31:08.765Z
  },
  leftdoor: {
    description: "leftdoor",
    image: leftdoor,
    position: { pan: -168.41, tilt: -48.93, zoom: 1 },
    // modified: 2026-09-10T23:45:30.083Z
  },
  leftplatform: {
    description: "leftplatform",
    image: leftplatform,
    position: { pan: -164.83, tilt: -17.72, zoom: 388 },
    // modified: 2026-09-10T22:31:55.123Z
  },
  leftplatformb: {
    description: "leftplatformb",
    image: leftplatformb,
    position: { pan: -164.46, tilt: -30.87, zoom: 172 },
    // modified: 2026-09-12T09:37:47.159Z
  },
  middle: {
    description: "middle",
    image: middle,
    position: { pan: -136.67, tilt: -43.28, zoom: 1 },
    // modified: 2026-09-10T23:47:36.526Z
  },
  topleft: {
    description: "topleft",
    image: topleft,
    position: { pan: 167.08, tilt: 0, zoom: 1 },
    // modified: 2026-09-16T18:32:48.817Z
  },
};

const servalindoor = {
  title: "Serval Indoor",
  group: "serval",
  presets: servalindoorPresets,
};

export default servalindoor;
