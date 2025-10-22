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
import platformright from "@/assets/presets/wolfindoor/platformright.png";
import platformrightb from "@/assets/presets/wolfindoor/platformrightb.png";
import right from "@/assets/presets/wolfindoor/right.png";
import water from "@/assets/presets/wolfindoor/water.png";

import type { Preset } from "../tech/cameras.types";

const wolfindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  center: {
    description: "Center",
    image: center,
  },
  doors: {
    description: "Doors",
    image: doors,
  },
  down: {
    description: "Down",
    image: down,
  },
  downleft: {
    description: "Down Left",
    image: downleft,
  },
  downright: {
    description: "Down Right",
    image: downright,
  },
  fencel: {
    description: "Fence Left",
    image: fencel,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
  neardoor: {
    description: "Near Door",
    image: neardoor,
  },
  platformcenter: {
    description: "Platform Center",
    image: platformcenter,
  },
  platformleft: {
    description: "Platform Left",
    image: platformleft,
  },
  platformleftb: {
    description: "Platform Left bottom",
    image: platformleftb,
  },
  platformright: {
    description: "Platform Right",
    image: platformright,
  },
  platformrightb: {
    description: "Platform Right bottom",
    image: platformrightb,
  },
  right: {
    description: "Right",
    image: right,
  },
  water: {
    description: "Water",
    image: water,
  },
};

const wolfindoor = {
  title: "Wolf Indoor",
  group: "wolf",
  presets: wolfindoorPresets,
};

export default wolfindoor;
