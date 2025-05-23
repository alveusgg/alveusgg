import { type StaticImageData } from "next/image";

import backright from "@/assets/presets/chicken/backright.png";
import down from "@/assets/presets/chicken/down.png";
import downright from "@/assets/presets/chicken/downright.png";
import food from "@/assets/presets/chicken/food.png";
import home from "@/assets/presets/chicken/home.png";
import left from "@/assets/presets/chicken/left.png";
import oliversleep from "@/assets/presets/chicken/oliversleep.png";
import right from "@/assets/presets/chicken/right.png";
import window from "@/assets/presets/chicken/window.png";

// import barrels from "@/assets/presets/chicken/barrels.png";
// import nuggetsleep from "@/assets/presets/chicken/nuggetsleep.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const chickenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  backright: {
    description: "Back right",
    image: backright,
  },
  down: {
    description: "Down",
    image: down,
  },
  downright: {
    description: "Down right",
    image: downright,
  },
  left: {
    description: "Left",
    image: left,
  },
  right: {
    description: "Right",
    image: right,
  },
  window: {
    description: "Window",
    image: window,
  },
  food: {
    description: "Food",
    image: food,
  },
  oliversleep: {
    description: "Oliver sleeping",
    image: oliversleep,
  },
  barrels: {
    description: "Barrels",
    //image: barrels,
  },
  nuggetsleep: {
    description: "Nugget sleeping",
    //image: nuggetsleep,
  },
};

const chicken = {
  title: "Chicken",
  presets: chickenPresets,
};

export default chicken;
