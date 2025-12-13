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
    // modified: 2025-10-09T11:10:30.444Z
  },
  digbox: {
    description: "Dig Box",
    image: digbox,
    // modified: 2025-10-09T11:10:30.448Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.448Z
  },
  downl: {
    description: "Down Left",
    image: downl,
    // modified: 2025-10-09T11:10:30.448Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    // modified: 2025-10-09T11:10:30.448Z
  },
  farcorner: {
    description: "Far Corner",
    image: farcorner,
    // modified: 2025-10-09T11:10:30.448Z
  },
  farcornerz: {
    description: "Far Corner Zoomed",
    image: farcornerz,
    // modified: 2025-10-09T11:10:30.448Z
  },
  heatlamp: {
    description: "Heat Lamp",
    image: heatlamp,
    // modified: 2025-10-09T11:10:30.448Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-09T11:10:30.448Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    // modified: 2025-10-09T11:10:30.448Z
  },
  nearcorner: {
    description: "Near Corner",
    image: nearcorner,
    // modified: 2025-10-09T11:10:30.452Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:30.448Z
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
    // modified: 2025-10-09T11:10:30.448Z
  },
  rightcornerz: {
    description: "Right Corner Zoomed",
    image: rightcornerz,
    // modified: 2025-10-09T11:10:30.440Z
  },
};

const pushpopindoor = {
  title: "Pushpop Indoor",
  group: "pushpop",
  presets: pushpopindoorPresets,
};

export default pushpopindoor;
