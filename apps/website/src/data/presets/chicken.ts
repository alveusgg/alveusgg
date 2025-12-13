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
    // modified: 2025-10-09T11:10:30.456Z
  },
  backcenter: {
    description: "Back center",
    image: backcenter,
    // modified: 2025-10-09T11:10:30.460Z
  },
  backlb: {
    description: "Back left branch",
    image: backlb,
    // modified: 2025-10-09T11:10:30.464Z
  },
  backleft: {
    description: "Back left",
    image: backleft,
    // modified: 2025-10-09T11:10:30.464Z
  },
  backright: {
    description: "Back right",
    image: backright,
    // modified: 2025-10-09T11:10:30.460Z
  },
  barrels: {
    description: "Barrels",
    image: barrels,
    // modified: 2025-10-09T11:10:30.464Z
  },
  center: {
    description: "Center",
    image: center,
    // modified: 2025-10-09T11:10:30.464Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.460Z
  },
  downleft: {
    description: "Down left",
    image: downleft,
    // modified: 2025-10-09T11:10:30.464Z
  },
  downright: {
    description: "Down right",
    image: downright,
    // modified: 2025-10-09T11:10:30.460Z
  },
  food: {
    description: "Food",
    image: food,
    // modified: 2025-10-09T11:10:30.464Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-09T11:10:30.464Z
  },
  leftrock: {
    description: "Left rock",
    image: leftrock,
    // modified: 2025-10-09T11:10:30.464Z
  },
  nuggethide: {
    description: "nuggethide",
    image: nuggethide,
    // modified: 2025-12-05T14:25:30.041Z
  },
  nuggetsleep: {
    description: "Nugget sleep spot",
    image: nuggetsleep,
    // modified: 2025-10-09T11:10:30.464Z
  },
  oliversleep: {
    description: "Oliver/Henrique sleep spot",
    image: oliversleep,
    // modified: 2025-10-09T11:10:30.464Z
  },
  ramp: {
    description: "Ramps",
    image: ramp,
    // modified: 2025-10-09T11:10:30.464Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:30.456Z
  },
  rightcorner: {
    description: "Right corner",
    image: rightcorner,
    // modified: 2025-10-09T11:10:30.468Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-10-09T11:10:30.468Z
  },
  window: {
    description: "Window",
    image: window,
    // modified: 2025-10-09T11:10:30.460Z
  },
};

const chicken = {
  title: "Chicken",
  group: "chicken",
  presets: chickenPresets,
};

export default chicken;
