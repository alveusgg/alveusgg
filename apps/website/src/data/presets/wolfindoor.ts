import center from "@/assets/presets/wolfindoor/center.png";
import doors from "@/assets/presets/wolfindoor/doors.png";
import down from "@/assets/presets/wolfindoor/down.png";
import downleft from "@/assets/presets/wolfindoor/downleft.png";
import downright from "@/assets/presets/wolfindoor/downright.png";
import fencel from "@/assets/presets/wolfindoor/fencel.png";
import home from "@/assets/presets/wolfindoor/home.png";
import left from "@/assets/presets/wolfindoor/left.png";
import leftcorner from "@/assets/presets/wolfindoor/leftcorner.png";
import neardoor from "@/assets/presets/wolfindoor/neardoor.png";
import platformcenter from "@/assets/presets/wolfindoor/platformcenter.png";
import platformleft from "@/assets/presets/wolfindoor/platformleft.png";
import platformleftb from "@/assets/presets/wolfindoor/platformleftb.png";
import platformlefttop from "@/assets/presets/wolfindoor/platformlefttop.png";
import platformright from "@/assets/presets/wolfindoor/platformright.png";
import platformrightb from "@/assets/presets/wolfindoor/platformrightb.png";
import right from "@/assets/presets/wolfindoor/right.png";
import water from "@/assets/presets/wolfindoor/water.png";

import type { Preset } from "../tech/cameras.types";

const wolfindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.280Z
  },
  center: {
    description: "Center",
    image: center,
    // modified: 2025-10-09T11:10:30.280Z
  },
  doors: {
    description: "Doors",
    image: doors,
    // modified: 2025-10-09T11:10:30.276Z
  },
  down: {
    description: "Down",
    image: down,
    // modified: 2025-10-09T11:10:30.276Z
  },
  downleft: {
    description: "Down Left",
    image: downleft,
    // modified: 2025-11-30T18:56:57.633Z
  },
  downright: {
    description: "Down Right",
    image: downright,
    // modified: 2025-10-09T11:10:30.276Z
  },
  fencel: {
    description: "Fence Left",
    image: fencel,
    // modified: 2025-10-09T11:10:30.280Z
  },
  left: {
    description: "Left",
    image: left,
    // modified: 2025-10-09T11:10:30.280Z
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
    // modified: 2025-11-30T18:56:57.633Z
  },
  neardoor: {
    description: "Near Door",
    image: neardoor,
    // modified: 2025-10-09T11:10:30.276Z
  },
  platformcenter: {
    description: "Platform Center",
    image: platformcenter,
    // modified: 2025-10-09T11:10:30.280Z
  },
  platformleft: {
    description: "Platform Left",
    image: platformleft,
    // modified: 2025-10-09T11:10:30.280Z
  },
  platformleftb: {
    description: "Platform Left bottom",
    image: platformleftb,
    // modified: 2025-10-09T11:10:30.276Z
  },
  platformlefttop: {
    description: "platformlefttop",
    image: platformlefttop,
    // modified: 2025-12-20T20:48:58.883Z
  },
  platformright: {
    description: "Platform Right",
    image: platformright,
    // modified: 2025-10-09T11:10:30.280Z
  },
  platformrightb: {
    description: "Platform Right bottom",
    image: platformrightb,
    // modified: 2025-10-09T11:10:30.276Z
  },
  right: {
    description: "Right",
    image: right,
    // modified: 2025-10-09T11:10:30.284Z
  },
  water: {
    description: "Water",
    image: water,
    // modified: 2025-11-30T18:56:57.633Z
  },
};

const wolfindoor = {
  title: "Wolf Indoor",
  group: "wolf",
  presets: wolfindoorPresets,
};

export default wolfindoor;
