import cubby from "@/assets/presets/foxindoor/cubby.png";
import den from "@/assets/presets/foxindoor/den.png";
import home from "@/assets/presets/foxindoor/home.png";
import leftcorner from "@/assets/presets/foxindoor/leftcorner.png";
import leftdoor from "@/assets/presets/foxindoor/leftdoor.png";
import leftplatform from "@/assets/presets/foxindoor/leftplatform.png";
import ramp from "@/assets/presets/foxindoor/ramp.png";
import rightdoor from "@/assets/presets/foxindoor/rightdoor.png";
import rightplatform from "@/assets/presets/foxindoor/rightplatform.png";
import window from "@/assets/presets/foxindoor/window.png";

import type { Preset } from "../tech/cameras.types";

const foxindoorPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2026-04-18T13:07:22.077Z
  },
  cubby: {
    description: "cubby",
    image: cubby,
    position: { pan: 51.42, tilt: 3.33, zoom: 7731 },
    // modified: 2026-04-18T13:11:04.772Z
  },
  den: {
    description: "den",
    image: den,
    position: { pan: 103.27, tilt: -40.75, zoom: 8731 },
    // modified: 2026-04-18T13:13:11.278Z
  },
  leftcorner: {
    description: "leftcorner",
    image: leftcorner,
    position: { pan: -87.37, tilt: -103.33, zoom: 6000 },
    // modified: 2026-04-18T13:12:41.158Z
  },
  leftdoor: {
    description: "leftdoor",
    image: leftdoor,
    position: { pan: -50.33, tilt: 17.5, zoom: 6000 },
    // modified: 2026-04-18T13:08:06.413Z
  },
  leftplatform: {
    description: "leftplatform",
    image: leftplatform,
    position: { pan: 16.16, tilt: 92, zoom: 7731 },
    // modified: 2026-04-18T13:09:33.067Z
  },
  ramp: {
    description: "ramp",
    image: ramp,
    position: { pan: 87.38, tilt: 73.42, zoom: 7000 },
    // modified: 2026-04-18T13:11:37.717Z
  },
  rightdoor: {
    description: "rightdoor",
    image: rightdoor,
    position: { pan: 103.5, tilt: -103.5, zoom: 6000 },
    // modified: 2026-04-18T13:13:45.623Z
  },
  rightplatform: {
    description: "rightplatform",
    image: rightplatform,
    position: { pan: 125.67, tilt: 9.83, zoom: 7731 },
    // modified: 2026-05-02T12:49:52.446Z
  },
  window: {
    description: "window",
    image: window,
    position: { pan: 24.8, tilt: 121.33, zoom: 7731 },
    // modified: 2026-04-18T13:10:25.412Z
  },
};

const foxindoor = {
  title: "Fox Indoor",
  group: "fox",
  presets: foxindoorPresets,
};

export default foxindoor;
