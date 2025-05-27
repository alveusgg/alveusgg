import backright from "@/assets/presets/chicken/backright.png";
import barrels from "@/assets/presets/chicken/barrels.png";
import down from "@/assets/presets/chicken/down.png";
import downright from "@/assets/presets/chicken/downright.png";
import food from "@/assets/presets/chicken/food.png";
import home from "@/assets/presets/chicken/home.png";
import left from "@/assets/presets/chicken/left.png";
import nuggetsleep from "@/assets/presets/chicken/nuggetsleep.png";
import oliversleep from "@/assets/presets/chicken/oliversleep.png";
import right from "@/assets/presets/chicken/right.png";
import window from "@/assets/presets/chicken/window.png";

import type { Preset } from "./preset";

const chickenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  backright: {
    description: "Back right",
    image: backright,
  },
  barrels: {
    description: "Barrels",
    image: barrels,
  },
  down: {
    description: "Down",
    image: down,
  },
  downright: {
    description: "Down right",
    image: downright,
  },
  food: {
    description: "Food",
    image: food,
  },
  left: {
    description: "Left",
    image: left,
  },
  nuggetsleep: {
    description: "Nugget sleep spot",
    image: nuggetsleep,
  },
  oliversleep: {
    description: "Oliver/Henrique sleep spot",
    image: oliversleep,
  },
  right: {
    description: "Right",
    image: right,
  },
  window: {
    description: "Window",
    image: window,
  },
};

const chicken = {
  title: "Chicken",
  group: "chicken",
  presets: chickenPresets,
};

export default chicken;
