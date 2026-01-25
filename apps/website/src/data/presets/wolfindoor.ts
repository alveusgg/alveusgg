import center from "@/assets/presets/wolfindoor/center.png";
import doors from "@/assets/presets/wolfindoor/doors.png";
import down from "@/assets/presets/wolfindoor/down.png";
import downleft from "@/assets/presets/wolfindoor/downleft.png";
import downright from "@/assets/presets/wolfindoor/downright.png";
import fencel from "@/assets/presets/wolfindoor/fencel.png";
import fencer from "@/assets/presets/wolfindoor/fencer.png";
import home from "@/assets/presets/wolfindoor/home.png";
import left from "@/assets/presets/wolfindoor/left.png";
import leftcorner from "@/assets/presets/wolfindoor/leftcorner.png";
import neardoor from "@/assets/presets/wolfindoor/neardoor.png";
import platformcenter from "@/assets/presets/wolfindoor/platformcenter.png";
import platformleft from "@/assets/presets/wolfindoor/platformleft.png";
import platformleftb from "@/assets/presets/wolfindoor/platformleftb.png";
import platformlefttop from "@/assets/presets/wolfindoor/platformlefttop.png";
import platformright from "@/assets/presets/wolfindoor/platformright.png";
import platformrightb from "@/assets/presets/wolfindoor/platformrightb.png";
import right from "@/assets/presets/wolfindoor/right.png";
import staffdoor from "@/assets/presets/wolfindoor/staffdoor.png";
import water from "@/assets/presets/wolfindoor/water.png";

import type { Preset } from "../tech/cameras.types";

const wolfindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -113.32, tilt: -19.13, zoom: 1 },
    // modified: 2025-10-09T11:10:30.280Z
  },
  center: {
    description: "Center",
    image: center,
    position: { pan: -127.65, tilt: -19.41, zoom: 1 },
    // modified: 2025-10-09T11:10:30.280Z
  },
  doors: {
    description: "Doors",
    image: doors,
    position: { pan: -147.99, tilt: -23.34, zoom: 1 },
    // modified: 2025-10-09T11:10:30.276Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -124.14, tilt: -35.77, zoom: 1 },
    // modified: 2025-10-09T11:10:30.276Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    position: { pan: -138.52, tilt: -63.98, zoom: 1 },
    // modified: 2025-11-30T18:56:57.633Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    position: { pan: -88.4, tilt: -53.37, zoom: 1 },
    // modified: 2025-10-09T11:10:30.276Z
  },
  fencel: {
    description: "Fence Left",
    image: fencel,
    position: { pan: -112.45, tilt: -8.69, zoom: 1 },
    // modified: 2025-10-09T11:10:30.280Z
  },
  fencer: {
    description: "fencer",
    image: fencer,
    position: { pan: -84.95, tilt: -11.85, zoom: 1 },
    // modified: 2026-01-20T14:39:32.950Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -130.86, tilt: -14.16, zoom: 1 },
    // modified: 2025-10-09T11:10:30.280Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -146.16, tilt: -13.96, zoom: 206 },
    // modified: 2025-11-30T18:56:57.633Z
  },
  neardoor: {
    description: "Near Door",
    image: neardoor,
    position: { pan: -152.3, tilt: -39.62, zoom: 1 },
    // modified: 2025-10-09T11:10:30.276Z
  },
  platformcenter: {
    description: "Platform Center",
    image: platformcenter,
    position: { pan: -120.16, tilt: -18.58, zoom: 91 },
    // modified: 2025-10-09T11:10:30.280Z
  },
  platformleft: {
    description: "Platform Left",
    image: platformleft,
    position: { pan: -133.15, tilt: -7.86, zoom: 246 },
    // modified: 2025-10-09T11:10:30.280Z
  },
  platformleftb: {
    description: "Platform Left bottom",
    image: platformleftb,
    position: { pan: -133.26, tilt: -10.93, zoom: 817 },
    // modified: 2025-10-09T11:10:30.276Z
  },
  platformlefttop: {
    description: "platformlefttop",
    image: platformlefttop,
    position: { pan: -133.52, tilt: -4.71, zoom: 923 },
    // modified: 2025-12-20T20:48:58.883Z
  },
  platformright: {
    description: "Platform Right",
    image: platformright,
    position: { pan: -76.13, tilt: -25.56, zoom: 1 },
    // modified: 2025-10-09T11:10:30.280Z
  },
  platformrightb: {
    description: "Platform Right bottom",
    image: platformrightb,
    position: { pan: -74.5, tilt: -36.6, zoom: 80 },
    // modified: 2025-10-09T11:10:30.276Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -101.98, tilt: -26.91, zoom: 1 },
    // modified: 2025-10-09T11:10:30.284Z
  },
  staffdoor: {
    description: "staffdoor",
    image: staffdoor,
    position: { pan: -71.08, tilt: -11.32, zoom: 1 },
    // modified: 2026-01-24T00:29:51.846Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -131.72, tilt: -23.22, zoom: 172 },
    // modified: 2025-11-30T18:56:57.633Z
  },
};

const wolfindoor = {
  title: "Wolf Indoor",
  group: "wolf",
  presets: wolfindoorPresets,
};

export default wolfindoor;
