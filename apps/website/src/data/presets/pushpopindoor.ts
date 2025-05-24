import digbox from "@/assets/presets/pushpopindoor/digbox.png";
import down from "@/assets/presets/pushpopindoor/down.png";
import downl from "@/assets/presets/pushpopindoor/downl.png";
import downr from "@/assets/presets/pushpopindoor/downr.png";
import farcorner from "@/assets/presets/pushpopindoor/farcorner.png";
import home from "@/assets/presets/pushpopindoor/home.png";
import left from "@/assets/presets/pushpopindoor/left.png";
import leftcorner from "@/assets/presets/pushpopindoor/leftcorner.png";
import right from "@/assets/presets/pushpopindoor/right.png";
import rightcorner from "@/assets/presets/pushpopindoor/rightcorner.png";

import type { Preset } from "./preset";

const pushpopindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  digbox: {
    description: "Dig Box",
    image: digbox,
  },
  down: {
    description: "Down",
    image: down,
  },
  downl: {
    description: "Down Left",
    image: downl,
  },
  downr: {
    description: "Down Right",
    image: downr,
  },
  farcorner: {
    description: "Far Corner",
    image: farcorner,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
  right: {
    description: "Right",
    image: right,
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
  },
};

const pushpopindoor = {
  title: "Pushpop Indoor",
  presets: pushpopindoorPresets,
};

export default pushpopindoor;
