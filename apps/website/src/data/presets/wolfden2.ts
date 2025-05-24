import { type StaticImageData } from "next/image";

import bottomright from "@/assets/presets/wolfden2/bottomright.png";
import home from "@/assets/presets/wolfden2/home.png";
import left from "@/assets/presets/wolfden2/left.png";
import leftcorner from "@/assets/presets/wolfden2/leftcorner.png";
import rightcorner from "@/assets/presets/wolfden2/rightcorner.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const wolfden2Presets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  bottomright: {
    description: "Bottom Right",
    image: bottomright,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftcorner: {
    description: "Left Corner",
    image: leftcorner,
  },
  rightcorner: {
    description: "Right Corner",
    image: rightcorner,
  },
};

const wolfden2 = {
  title: "Wolf Den 2",
  presets: wolfden2Presets,
};

export default wolfden2;
