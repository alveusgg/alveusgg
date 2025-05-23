import { type StaticImageData } from "next/image";

import home from "@/assets/presets/georgie/home.png";
// import cave from "@/assets/presets/georgie/cave.png";
// import down from "@/assets/presets/georgie/down.png";
// import downl from "@/assets/presets/georgie/downl.png";
// import downr from "@/assets/presets/georgie/downr.png";
// import land from "@/assets/presets/georgie/land.png";
// import landz from "@/assets/presets/georgie/landz.png";
import shore from "@/assets/presets/georgie/shore.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const georgiePresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  cave: {
    description: "Cave",
    //image: cave,
  },
  down: {
    description: "Down",
    //image: down,
  },
  downl: {
    description: "Down left",
    //image: downl,
  },
  downr: {
    description: "Down right",
    //image: downr,
  },
  land: {
    description: "Land",
    //image: land,
  },
  landz: {
    description: "Land z",
    //image: landz,
  },
  shore: {
    description: "Shore",
    image: shore,
  },
};

const georgie = {
  title: "Georgie",
  presets: georgiePresets,
};

export default georgie;
