import { type StaticImageData } from "next/image";

import doors from "@/assets/presets/wolfindoor/doors.png";
import home from "@/assets/presets/wolfindoor/home.png";
import left from "@/assets/presets/wolfindoor/left.png";
import platformcenter from "@/assets/presets/wolfindoor/platformcenter.png";
import platformleft from "@/assets/presets/wolfindoor/platformleft.png";
import platformright from "@/assets/presets/wolfindoor/platformright.png";
import right from "@/assets/presets/wolfindoor/right.png";

// import center from "@/assets/presets/wolfindoor/center.png";
// import down from "@/assets/presets/wolfindoor/down.png";
// import downright from "@/assets/presets/wolfindoor/downright.png";
// import neardoor from "@/assets/presets/wolfindoor/neardoor.png";
// import platformleftb from "@/assets/presets/wolfindoor/platformleftb.png";
// import platformrightb from "@/assets/presets/wolfindoor/platformrightb.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const wolfindoorPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  doors: {
    description: "Doors",
    image: doors,
  },
  left: {
    description: "Left",
    image: left,
  },
  right: {
    description: "Right",
    image: right,
  },
  platformcenter: {
    description: "Platform Center",
    image: platformcenter,
  },
  platformleft: {
    description: "Platform Left",
    image: platformleft,
  },
  platformright: {
    description: "Platform Right",
    image: platformright,
  },
  center: {
    description: "Center",
    //image: center,
  },
  down: {
    description: "Down",
    //image: down,
  },
  downright: {
    description: "Down Right",
    //image: downright,
  },
  neardoor: {
    description: "Near Door",
    //image: neardoor,
  },
  platformleftb: {
    description: "Platform Left (b)",
    //image: platformleftb,
  },
  platformrightb: {
    description: "Platform Right (b)",
    //image: platformrightb,
  },
};

const wolfindoor = {
  title: "Wolf Indoor",
  presets: wolfindoorPresets,
};

export default wolfindoor;
