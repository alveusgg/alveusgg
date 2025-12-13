import backcenter from "@/assets/presets/chicken/backcenter.png";
import backlb from "@/assets/presets/chicken/backlb.png";
import backleft from "@/assets/presets/chicken/backleft.png";
import backright from "@/assets/presets/chicken/backright.png";
import barrels from "@/assets/presets/chicken/barrels.png";
import center from "@/assets/presets/chicken/center.png";
import down from "@/assets/presets/chicken/down.png";
import downleft from "@/assets/presets/chicken/downleft.png";
import downright from "@/assets/presets/chicken/downright.png";
import food from "@/assets/presets/chicken/food.png";
import home from "@/assets/presets/chicken/home.png";
import left from "@/assets/presets/chicken/left.png";
import leftrock from "@/assets/presets/chicken/leftrock.png";
import nuggethide from "@/assets/presets/chicken/nuggethide.png";
import nuggetsleep from "@/assets/presets/chicken/nuggetsleep.png";
import oliversleep from "@/assets/presets/chicken/oliversleep.png";
import ramp from "@/assets/presets/chicken/ramp.png";
import right from "@/assets/presets/chicken/right.png";
import rightcorner from "@/assets/presets/chicken/rightcorner.png";
import water from "@/assets/presets/chicken/water.png";
import window from "@/assets/presets/chicken/window.png";

import type { Preset } from "../tech/cameras.types";

const chickenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  backcenter: {
    description: "Back center",
    image: backcenter,
  },
  backlb: {
    description: "Back left branch",
    image: backlb,
  },
  backleft: {
    description: "Back left",
    image: backleft,
  },
  backright: {
    description: "Back right",
    image: backright,
  },
  barrels: {
    description: "Barrels",
    image: barrels,
  },
  center: {
    description: "Center",
    image: center,
  },
  down: {
    description: "Down",
    image: down,
  },
  downleft: {
    description: "Down left",
    image: downleft,
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
  leftrock: {
    description: "Left rock",
    image: leftrock,
  },
  nuggethide: {
    description: "nuggethide",
    image: nuggethide,
  },
  nuggetsleep: {
    description: "Nugget sleep spot",
    image: nuggetsleep,
  },
  oliversleep: {
    description: "Oliver/Henrique sleep spot",
    image: oliversleep,
  },
  ramp: {
    description: "Ramps",
    image: ramp,
  },
  right: {
    description: "Right",
    image: right,
  },
  rightcorner: {
    description: "Right corner",
    image: rightcorner,
  },
  water: {
    description: "Water",
    image: water,
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
