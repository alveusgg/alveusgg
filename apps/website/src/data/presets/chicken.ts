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
    position: { pan: -40, tilt: -16.42, zoom: 1 },
    // modified: 2025-10-09T11:10:30.456Z
  },
  backcenter: {
    description: "Back center",
    image: backcenter,
    position: { pan: -53.11, tilt: -8.88, zoom: 828 },
    // modified: 2025-10-09T11:10:30.460Z
  },
  backlb: {
    description: "Back left branch",
    image: backlb,
    position: { pan: -63.16, tilt: -6.3, zoom: 2571 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  backleft: {
    description: "Back left",
    image: backleft,
    position: { pan: -61.62, tilt: -8.98, zoom: 736 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  backright: {
    description: "Back right",
    image: backright,
    position: { pan: -43.56, tilt: -6.13, zoom: 1112 },
    // modified: 2025-10-09T11:10:30.460Z
  },
  barrels: {
    description: "Barrels",
    image: barrels,
    position: { pan: -37.12, tilt: -13.97, zoom: 1987 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  center: {
    description: "Center",
    image: center,
    position: { pan: -25.81, tilt: -26.05, zoom: 1 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  down: {
    description: "Down",
    image: down,
    position: { pan: -23.23, tilt: -67.07, zoom: 1 },
    // modified: 2025-10-09T11:10:30.460Z
  },
  downleft: {
    description: "Down left",
    image: downleft,
    position: { pan: -41.53, tilt: -37.9, zoom: 1 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  downright: {
    description: "Down right",
    image: downright,
    position: { pan: -9.36, tilt: -43.51, zoom: 1 },
    // modified: 2025-10-09T11:10:30.460Z
  },
  food: {
    description: "Food",
    image: food,
    position: { pan: -29.61, tilt: -10.6, zoom: 2709 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  left: {
    description: "Left",
    image: left,
    position: { pan: -43.51, tilt: -23.78, zoom: 1 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  leftrock: {
    description: "Left rock",
    image: leftrock,
    position: { pan: -56.12, tilt: -20.57, zoom: 505 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  nuggethide: {
    description: "nuggethide",
    image: nuggethide,
    position: { pan: -65.37, tilt: -2.04, zoom: 10047 },
    // modified: 2025-12-05T14:25:30.041Z
  },
  nuggetsleep: {
    description: "Nugget sleep spot",
    image: nuggetsleep,
    position: { pan: -43.56, tilt: -3.13, zoom: 3386 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  oliversleep: {
    description: "Oliver/Henrique sleep spot",
    image: oliversleep,
    position: { pan: -17.18, tilt: -14.38, zoom: 783 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  ramp: {
    description: "Ramps",
    image: ramp,
    position: { pan: -29.41, tilt: -9.51, zoom: 736 },
    // modified: 2025-10-09T11:10:30.464Z
  },
  right: {
    description: "Right",
    image: right,
    position: { pan: -7.35, tilt: -25.84, zoom: 1 },
    // modified: 2025-10-09T11:10:30.456Z
  },
  rightcorner: {
    description: "Right corner",
    image: rightcorner,
    position: { pan: 11.41, tilt: -17.95, zoom: 482 },
    // modified: 2025-10-09T11:10:30.468Z
  },
  water: {
    description: "Water",
    image: water,
    position: { pan: -43.7, tilt: -12, zoom: 1402 },
    // modified: 2025-10-09T11:10:30.468Z
  },
  window: {
    description: "Window",
    image: window,
    position: { pan: -26.59, tilt: -0.01, zoom: 5962 },
    // modified: 2025-10-09T11:10:30.460Z
  },
};

const chicken = {
  title: "Chicken",
  group: "chicken",
  presets: chickenPresets,
};

export default chicken;
