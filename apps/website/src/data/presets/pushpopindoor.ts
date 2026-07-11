import down from "@/assets/presets/pushpopindoor/down.png";
import downleft from "@/assets/presets/pushpopindoor/downleft.png";
import downright from "@/assets/presets/pushpopindoor/downright.png";
import farcorner from "@/assets/presets/pushpopindoor/farcorner.png";
import farcornerz from "@/assets/presets/pushpopindoor/farcornerz.png";
import home from "@/assets/presets/pushpopindoor/home.png";
import left from "@/assets/presets/pushpopindoor/left.png";
import leftcorner from "@/assets/presets/pushpopindoor/leftcorner.png";
import right from "@/assets/presets/pushpopindoor/right.png";
import rightcorner from "@/assets/presets/pushpopindoor/rightcorner.png";
import rightcornerz from "@/assets/presets/pushpopindoor/rightcornerz.png";

import type { Preset } from "../tech/cameras.types";

const pushpopindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -45.91, tilt: -26.36, zoom: 1 },
    // modified: 2026-07-10T12:50:31.371Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -43.18, tilt: -68.02, zoom: 1 },
    // modified: 2026-07-10T12:56:56.137Z
  },
  downleft: {
    description: "downleft",
    image: downleft,
    position: { pan: -72.22, tilt: -41.96, zoom: 1 },
    // modified: 2026-07-10T12:53:53.254Z
  },
  downright: {
    description: "downright",
    image: downright,
    position: { pan: -35.21, tilt: -41.85, zoom: 1 },
    // modified: 2026-07-10T13:02:11.391Z
  },
  farcorner: {
    description: "Far Corner",
    image: farcorner,
    position: { pan: -55.92, tilt: -13.12, zoom: 1 },
    // modified: 2026-07-10T13:05:48.430Z
  },
  farcornerz: {
    description: "Far Corner Zoomed",
    image: farcornerz,
    position: { pan: -55.14, tilt: -15.37, zoom: 2500 },
    // modified: 2026-07-10T13:08:05.856Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -80.56, tilt: -23.06, zoom: 1 },
    // modified: 2026-07-10T12:51:23.592Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: -85.14, tilt: -18.37, zoom: 1501 },
    // modified: 2026-07-10T12:52:49.185Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -29.96, tilt: -25.64, zoom: 1 },
    // modified: 2026-07-10T13:00:23.325Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    position: { pan: -16.72, tilt: -15.18, zoom: 3601 },
    // modified: 2026-07-10T12:45:02.566Z
  },
  rightcornerz: {
    description: "Right Corner Zoomed",
    image: rightcornerz,
    position: { pan: -15.12, tilt: -15.11, zoom: 10200 },
    // modified: 2026-07-10T12:40:08.189Z
  },
};

const pushpopindoor = {
  title: "Pushpop Indoor",
  group: "pushpop",
  presets: pushpopindoorPresets,
};

export default pushpopindoor;
