import down from "@/assets/presets/chickenindoor/down.png";
import downl from "@/assets/presets/chickenindoor/downl.png";
import downmiddle from "@/assets/presets/chickenindoor/downmiddle.png";
import downr from "@/assets/presets/chickenindoor/downr.png";
import entryl from "@/assets/presets/chickenindoor/entryl.png";
import entryr from "@/assets/presets/chickenindoor/entryr.png";
import home from "@/assets/presets/chickenindoor/home.png";
import humandoor from "@/assets/presets/chickenindoor/humandoor.png";
import nestboxes from "@/assets/presets/chickenindoor/nestboxes.png";
import perches from "@/assets/presets/chickenindoor/perches.png";
import perchl from "@/assets/presets/chickenindoor/perchl.png";
import perchr from "@/assets/presets/chickenindoor/perchr.png";
import right from "@/assets/presets/chickenindoor/right.png";

import type { Preset } from "../tech/cameras.types";

const chickenindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -92.66, tilt: -11.41, zoom: 1 },
    // modified: 2025-10-09T11:10:30.468Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -53.32, tilt: -81.63, zoom: 1 },
    // modified: 2025-10-09T11:10:30.468Z
  },
  downl: {
    description: "Down Left",
    image: downl,
    position: { pan: -95.79, tilt: -49.06, zoom: 1 },
    // modified: 2025-10-09T11:10:30.468Z
  },
  downmiddle: {
    description: "Down Middle",
    image: downmiddle,
    position: { pan: -64.85, tilt: -29.54, zoom: 1 },
    // modified: 2025-10-09T11:10:30.468Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    position: { pan: 6.95, tilt: -60.39, zoom: 1 },
    // modified: 2025-10-09T11:10:30.468Z
  },
  entryl: {
    description: "Entry Left",
    image: entryl,
    position: { pan: -114.85, tilt: -15.97, zoom: 2221 },
    // modified: 2025-10-09T11:10:30.472Z
  },
  entryr: {
    description: "Entry Right",
    image: entryr,
    position: { pan: -75.98, tilt: -12.59, zoom: 3551 },
    // modified: 2025-10-09T11:10:30.472Z
  },
  humandoor: {
    description: "Human Door",
    image: humandoor,
    position: { pan: -47.71, tilt: -16.87, zoom: 1 },
    // modified: 2025-10-09T11:10:30.472Z
  },
  nestboxes: {
    description: "Nest Boxes",
    image: nestboxes,
    position: { pan: -2.36, tilt: -15.75, zoom: 1 },
    // modified: 2025-10-09T11:10:30.472Z
  },
  perches: {
    description: "Perches",
    image: perches,
    position: { pan: -93.51, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.472Z
  },
  perchl: {
    description: "Perch Left",
    image: perchl,
    position: { pan: -109.17, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.472Z
  },
  perchr: {
    description: "Perch Right",
    image: perchr,
    position: { pan: -71.11, tilt: 0, zoom: 443 },
    // modified: 2025-10-09T11:10:30.472Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -36.42, tilt: -33.05, zoom: 1 },
    // modified: 2025-10-09T11:10:30.472Z
  },
};

const chickenindoor = {
  title: "Chicken Indoor",
  group: "chicken",
  presets: chickenindoorPresets,
};

export default chickenindoor;
