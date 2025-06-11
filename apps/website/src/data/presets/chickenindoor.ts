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

import type { Preset } from "../tech/cameras.types.ts";

const chickenindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  down: {
    description: "Down",
    image: down,
  },
  downl: {
    description: "Down Left",
    image: downl,
  },
  downmiddle: {
    description: "Down Middle",
    image: downmiddle,
  },
  downr: {
    description: "Down Right",
    image: downr,
  },
  entryl: {
    description: "Entry Left",
    image: entryl,
  },
  entryr: {
    description: "Entry Right",
    image: entryr,
  },
  humandoor: {
    description: "Human Door",
    image: humandoor,
  },
  nestboxes: {
    description: "Nest Boxes",
    image: nestboxes,
  },
  perches: {
    description: "Perches",
    image: perches,
  },
  perchl: {
    description: "Perch Left",
    image: perchl,
  },
  perchr: {
    description: "Perch Right",
    image: perchr,
  },
  right: {
    description: "Right",
    image: right,
  },
};

const chickenindoor = {
  title: "Chicken Indoor",
  group: "chicken",
  presets: chickenindoorPresets,
};

export default chickenindoor;
