import { type StaticImageData } from "next/image";

import down from "@/assets/presets/roaches/down.png";
import food from "@/assets/presets/roaches/food.png";
import home from "@/assets/presets/roaches/home.png";
import left from "@/assets/presets/roaches/left.png";

// import downr from "@/assets/presets/roaches/downr.png";
// import right from "@/assets/presets/roaches/right.png";
// import stickl from "@/assets/presets/roaches/stickl.png";
// import sticklt from "@/assets/presets/roaches/sticklt.png";
// import stickr from "@/assets/presets/roaches/stickr.png";
// import stickrt from "@/assets/presets/roaches/stickrt.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const roachesPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  left: {
    description: "Left",
    image: left,
  },
  down: {
    description: "Down",
    image: down,
  },
  food: {
    description: "Food",
    image: food,
  },
  downr: {
    description: "Down Right",
    //image: downr,
  },
  right: {
    description: "Right",
    //image: right,
  },
  stickl: {
    description: "Stick Left",
    //image: stickl,
  },
  sticklt: {
    description: "Stick Left Top",
    //image: sticklt,
  },
  stickr: {
    description: "Stick Right",
    //image: stickr,
  },
  stickrt: {
    description: "Stick Right Top",
    //image: stickrt,
  },
};

const roaches = {
  title: "Roaches",
  presets: roachesPresets,
};

export default roaches;
