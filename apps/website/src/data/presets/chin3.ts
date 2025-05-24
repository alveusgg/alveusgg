import { type StaticImageData } from "next/image";

import home from "@/assets/presets/chin3/home.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const chin3Presets: Record<string, Preset> = {
  home: {
    description: "Home, cam cannot move",
    image: home,
  },
};

const chin3 = {
  title: "Chin Lower Right",
  presets: chin3Presets,
};

export default chin3;
