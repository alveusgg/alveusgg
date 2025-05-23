import { type StaticImageData } from "next/image";

// import digbox from "@/assets/presets/pushpopindoor/digbox.png";
// import down from "@/assets/presets/pushpopindoor/down.png";
// import downl from "@/assets/presets/pushpopindoor/downl.png";
// import downr from "@/assets/presets/pushpopindoor/downr.png";
// import home from "@/assets/presets/pushpopindoor/home.png";
// import leftcorner from "@/assets/presets/pushpopindoor/leftcorner.png";
// import rightcorner from "@/assets/presets/pushpopindoor/rightcorner.png";
// import farcorner from "@/assets/presets/pushpopindoor/farcorner.png";
// import left from "@/assets/presets/pushpopindoor/left.png";
// import right from "@/assets/presets/pushpopindoor/right.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const pushpopindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    // image: home,
  },
  leftcorner: {
    description: "Left Corner",
    // image: leftcorner,
  },
  rightcorner: {
    description: "Right Corner",
    // image: rightcorner,
  },
  farcorner: {
    description: "Far Corner",
    // image: farcorner,
  },
  left: {
    description: "Left",
    // image: left,
  },
  downl: {
    description: "Down Left",
    // image: downl,
  },
  downr: {
    description: "Down Right",
    // image: downr,
  },
  down: {
    description: "Down",
    // image: down,
  },
};

const pushpopindoor = {
  title: "Pushpop Indoor",
  presets: pushpopindoorPresets,
};

export default pushpopindoor;
