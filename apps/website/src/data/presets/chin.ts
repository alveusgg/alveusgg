import { type StaticImageData } from "next/image";

import home from "@/assets/presets/chin/home.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const chinPresets: Record<string, Preset> = {
  home: {
    description: "Home, cam cannot move",
    image: home,
  },
};

const chin = {
  title: "Chin Top",
  presets: chinPresets,
};

export default chin;
