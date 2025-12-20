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
    // modified: 2025-10-09T11:10:29.896Z
  },
  cave: {
    description: "Cave",
    image: cave,
    // modified: 2025-10-09T11:10:29.892Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:29.892Z
  },
  downl: {
    description: "Down left",
    image: downl,
    // modified: 2025-10-09T11:10:29.892Z
  },
  downr: {
    description: "Down right",
    image: downr,
    // modified: 2025-10-09T11:10:29.892Z
  },
  far: {
    description: "Far",
    image: far,
    // modified: 2025-12-19T02:46:46.222Z
  },
  land: {
    description: "Land",
    image: land,
    // modified: 2025-10-09T11:10:29.892Z
  },
  landz: {
    description: "Land zoomed in",
    image: landz,
    // modified: 2025-10-09T11:10:29.892Z
  },
  shore: {
    description: "Shore",
    image: shore,
    // modified: 2025-10-09T11:10:29.896Z
  },
};

const georgie = {
  title: "Georgie",
  group: "georgie",
  presets: georgiePresets,
};

export default georgie;
