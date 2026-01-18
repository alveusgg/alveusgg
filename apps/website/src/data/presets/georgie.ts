import cave from "@/assets/presets/georgie/cave.png";
import down from "@/assets/presets/georgie/down.png";
import downl from "@/assets/presets/georgie/downl.png";
import downr from "@/assets/presets/georgie/downr.png";
import far from "@/assets/presets/georgie/far.png";
import home from "@/assets/presets/georgie/home.png";
import land from "@/assets/presets/georgie/land.png";
import landz from "@/assets/presets/georgie/landz.png";
import shore from "@/assets/presets/georgie/shore.png";

import type { Preset } from "../tech/cameras.types";

const georgiePresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 48.63, tilt: -16.91, zoom: 1 },
    // modified: 2025-10-09T11:10:29.896Z
  },
  cave: {
    description: "Cave",
    image: cave,
    position: { pan: 35.27, tilt: -22.5, zoom: 3982 },
    // modified: 2025-10-09T11:10:29.892Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -44.22, tilt: -64.68, zoom: 1 },
    // modified: 2025-10-09T11:10:29.892Z
  },
  downl: {
    description: "Down left",
    image: downl,
    position: { pan: -93, tilt: -53.17, zoom: 1 },
    // modified: 2025-10-09T11:10:29.892Z
  },
  downr: {
    description: "Down right",
    image: downr,
    position: { pan: 15.48, tilt: -57.37, zoom: 1 },
    // modified: 2025-10-09T11:10:29.892Z
  },
  far: {
    description: "Far",
    image: far,
    position: { pan: 48.62, tilt: -8.96, zoom: 10181 },
    // modified: 2025-12-19T02:46:46.222Z
  },
  land: {
    description: "Land",
    image: land,
    position: { pan: 42.96, tilt: -20.39, zoom: 2000 },
    // modified: 2025-10-09T11:10:29.892Z
  },
  landz: {
    description: "Land zoomed in",
    image: landz,
    position: { pan: 48.65, tilt: -19.91, zoom: 4702 },
    // modified: 2025-10-09T11:10:29.892Z
  },
  shore: {
    description: "Shore",
    image: shore,
    position: { pan: 32.05, tilt: -39.56, zoom: 1 },
    // modified: 2025-10-09T11:10:29.896Z
  },
};

const georgie = {
  title: "Georgie",
  group: "georgie",
  presets: georgiePresets,
};

export default georgie;
