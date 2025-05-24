import { type StaticImageData } from "next/image";

import home from "@/assets/presets/chin2/home.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const chin2Presets: Record<string, Preset> = {
  home: {
    description: "Home, cam cannot move",
    image: home,
  },
};

const chin2 = {
  title: "Chin Lower Left",
  presets: chin2Presets,
};

export default chin2;
