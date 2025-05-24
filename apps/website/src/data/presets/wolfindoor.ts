import center from "@/assets/presets/wolfindoor/center.png";
import doors from "@/assets/presets/wolfindoor/doors.png";
import down from "@/assets/presets/wolfindoor/down.png";
import downright from "@/assets/presets/wolfindoor/downright.png";
import home from "@/assets/presets/wolfindoor/home.png";
import left from "@/assets/presets/wolfindoor/left.png";
import neardoor from "@/assets/presets/wolfindoor/neardoor.png";
import platformcenter from "@/assets/presets/wolfindoor/platformcenter.png";
import platformleft from "@/assets/presets/wolfindoor/platformleft.png";
import platformleftb from "@/assets/presets/wolfindoor/platformleftb.png";
import platformright from "@/assets/presets/wolfindoor/platformright.png";
import platformrightb from "@/assets/presets/wolfindoor/platformrightb.png";
import right from "@/assets/presets/wolfindoor/right.png";

import type { Preset } from "./preset";

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
  downright: {
    description: "Down Right",
    image: downright,
  },
  left: {
    description: "Left",
    image: left,
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
};

const wolfindoor = {
  title: "Wolf Indoor",
  presets: wolfindoorPresets,
};

export default wolfindoor;
