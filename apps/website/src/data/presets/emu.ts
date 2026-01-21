import feeder from "@/assets/presets/emu/feeder.png";
import feedwide from "@/assets/presets/emu/feedwide.png";
import foodleft from "@/assets/presets/emu/foodleft.png";
import foodright from "@/assets/presets/emu/foodright.png";
import gate from "@/assets/presets/emu/gate.png";
import gateleft from "@/assets/presets/emu/gateleft.png";
import home from "@/assets/presets/emu/home.png";
import marmgate from "@/assets/presets/emu/marmgate.png";
import pen1center from "@/assets/presets/emu/pen1center.png";
import pen1centerright from "@/assets/presets/emu/pen1centerright.png";
import pen1left from "@/assets/presets/emu/pen1left.png";
import pen1right from "@/assets/presets/emu/pen1right.png";
import pen1shelter from "@/assets/presets/emu/pen1shelter.png";
import pen2left from "@/assets/presets/emu/pen2left.png";
import pen2middleish from "@/assets/presets/emu/pen2middleish.png";
import pen2right from "@/assets/presets/emu/pen2right.png";

import type { Preset } from "../tech/cameras.types";

const emuPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: -122.67, tilt: -4.79, zoom: 1 },
    // modified: 2025-10-09T11:10:30.328Z
  },
  feeder: {
    description: "feeder",
    image: feeder,
    position: { pan: 71.02, tilt: -18.65, zoom: 1 },
    // modified: 2025-10-25T18:38:15.313Z
  },
  feedwide: {
    description: "feedwide",
    image: feedwide,
    position: { pan: 85.54, tilt: -12.83, zoom: 1 },
    // modified: 2025-10-28T22:40:32.291Z
  },
  foodleft: {
    description: "Food Left",
    image: foodleft,
    position: { pan: -2.06, tilt: -15.16, zoom: 498 },
    // modified: 2025-10-09T11:10:30.324Z
  },
  foodright: {
    description: "Food Right",
    image: foodright,
    position: { pan: 92.46, tilt: -9.56, zoom: 572 },
    // modified: 2025-10-09T11:10:30.324Z
  },
  gate: {
    description: "Gate",
    image: gate,
    position: { pan: -60.85, tilt: -1.48, zoom: 1 },
    // modified: 2025-10-09T11:10:30.324Z
  },
  gateleft: {
    description: "Gate Left",
    image: gateleft,
    position: { pan: -94.69, tilt: -2.12, zoom: 1 },
    // modified: 2025-10-09T11:10:30.332Z
  },
  marmgate: {
    description: "Marmoset Gate",
    image: marmgate,
    position: { pan: -152.35, tilt: -1.82, zoom: 1 },
    // modified: 2025-10-09T11:10:30.328Z
  },
  pen1center: {
    description: "pen1center",
    image: pen1center,
    position: { pan: -179.53, tilt: -2.18, zoom: 1 },
    // modified: 2025-10-09T11:10:30.328Z
  },
  pen1centerright: {
    description: "pen1centerright",
    image: pen1centerright,
    position: { pan: -151.09, tilt: -2.95, zoom: 1 },
    // modified: 2025-10-09T11:10:30.332Z
  },
  pen1left: {
    description: "Pen 1 Left",
    image: pen1left,
    position: { pan: 127.4, tilt: -3.14, zoom: 1 },
    // modified: 2025-10-09T11:10:30.328Z
  },
  pen1right: {
    description: "Pen 1 Right",
    image: pen1right,
    position: { pan: -122.96, tilt: -2.52, zoom: 1 },
    // modified: 2025-10-09T11:10:30.328Z
  },
  pen1shelter: {
    description: "Pen 1 Shelter",
    image: pen1shelter,
    position: { pan: 70.91, tilt: -30.11, zoom: 1 },
    // modified: 2025-10-09T11:10:30.332Z
  },
  pen2left: {
    description: "Pen 2 Left",
    image: pen2left,
    position: { pan: -18.26, tilt: -5.05, zoom: 1 },
    // modified: 2025-10-09T11:10:30.324Z
  },
  pen2middleish: {
    description: "Pen 2 Middle-ish",
    image: pen2middleish,
    position: { pan: -1.54, tilt: -3.28, zoom: 584 },
    // modified: 2025-12-04T00:17:59.334Z
  },
  pen2right: {
    description: "Pen 2 Right",
    image: pen2right,
    position: { pan: 99.54, tilt: -3.02, zoom: 1 },
    // modified: 2025-10-09T11:10:30.324Z
  },
};

const emu = {
  title: "Emu",
  group: "emu",
  presets: emuPresets,
};

export default emu;
