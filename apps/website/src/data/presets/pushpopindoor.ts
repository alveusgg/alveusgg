import digbox from "@/assets/presets/pushpopindoor/digbox.png";
import down from "@/assets/presets/pushpopindoor/down.png";
import downl from "@/assets/presets/pushpopindoor/downl.png";
import downr from "@/assets/presets/pushpopindoor/downr.png";
import farcorner from "@/assets/presets/pushpopindoor/farcorner.png";
import farcornerz from "@/assets/presets/pushpopindoor/farcornerz.png";
import heatlamp from "@/assets/presets/pushpopindoor/heatlamp.png";
import home from "@/assets/presets/pushpopindoor/home.png";
import left from "@/assets/presets/pushpopindoor/left.png";
import leftcorner from "@/assets/presets/pushpopindoor/leftcorner.png";
import nearcorner from "@/assets/presets/pushpopindoor/nearcorner.png";
import right from "@/assets/presets/pushpopindoor/right.png";
import rightcorner from "@/assets/presets/pushpopindoor/rightcorner.png";
import rightcornerz from "@/assets/presets/pushpopindoor/rightcornerz.png";

import type { Preset } from "../tech/cameras.types";

const pushpopindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 74.32, tilt: -20.43, zoom: 1 },
    // modified: 2025-10-09T11:10:30.444Z
  },
  digbox: {
    description: "Dig Box",
    image: digbox,
    position: { pan: 79.65, tilt: -14.17, zoom: 1249 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: 88.57, tilt: -76.5, zoom: 1 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  downl: {
    description: "Down Left",
    image: downl,
    position: { pan: 55.83, tilt: -48.78, zoom: 1 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    position: { pan: 104.7, tilt: -63.63, zoom: 1 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  farcorner: {
    description: "Far Corner",
    image: farcorner,
    position: { pan: 69.66, tilt: -6.18, zoom: 4934 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  farcornerz: {
    description: "Far Corner Zoomed",
    image: farcornerz,
    position: { pan: 69.42, tilt: -5.81, zoom: 10442 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  heatlamp: {
    description: "Heat Lamp",
    image: heatlamp,
    position: { pan: 115.25, tilt: -23.66, zoom: 1 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: 50.03, tilt: -19.64, zoom: 1 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    position: { pan: 32.86, tilt: -9.22, zoom: 2650 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  nearcorner: {
    description: "Near Corner",
    image: nearcorner,
    position: { pan: 167.16, tilt: -72.48, zoom: 1 },
    // modified: 2025-10-09T11:10:30.452Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: 96.31, tilt: -18.18, zoom: 1 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    position: { pan: 107.25, tilt: -7.83, zoom: 2451 },
    // modified: 2025-10-09T11:10:30.448Z
  },
  rightcornerz: {
    description: "Right Corner Zoomed",
    image: rightcornerz,
    position: { pan: 113.78, tilt: -10.57, zoom: 9083 },
    // modified: 2025-10-09T11:10:30.440Z
  },
};

const pushpopindoor = {
  title: "Pushpop Indoor",
  group: "pushpop",
  presets: pushpopindoorPresets,
};

export default pushpopindoor;
