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
    // modified: 2025-10-09T11:10:30.468Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.468Z
  },
  downl: {
    description: "Down Left",
    image: downl,
    // modified: 2025-10-09T11:10:30.468Z
  },
  downmiddle: {
    description: "Down Middle",
    image: downmiddle,
    // modified: 2025-10-09T11:10:30.468Z
  },
  downr: {
    description: "Down Right",
    image: downr,
    // modified: 2025-10-09T11:10:30.468Z
  },
  entryl: {
    description: "Entry Left",
    image: entryl,
    // modified: 2025-10-09T11:10:30.472Z
  },
  entryr: {
    description: "Entry Right",
    image: entryr,
    // modified: 2025-10-09T11:10:30.472Z
  },
  humandoor: {
    description: "Human Door",
    image: humandoor,
    // modified: 2025-10-09T11:10:30.472Z
  },
  nestboxes: {
    description: "Nest Boxes",
    image: nestboxes,
    // modified: 2025-10-09T11:10:30.472Z
  },
  perches: {
    description: "Perches",
    image: perches,
    // modified: 2025-10-09T11:10:30.472Z
  },
  perchl: {
    description: "Perch Left",
    image: perchl,
    // modified: 2025-10-09T11:10:30.472Z
  },
  perchr: {
    description: "Perch Right",
    image: perchr,
    // modified: 2025-10-09T11:10:30.472Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:30.472Z
  },
};

const chickenindoor = {
  title: "Chicken Indoor",
  group: "chicken",
  presets: chickenindoorPresets,
};

export default chickenindoor;
