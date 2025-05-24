import { type StaticImageData } from "next/image";

import home from "@/assets/presets/georgiewater/home.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const georgiewaterPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
};

const georgiewater = {
  title: "Georgie Water",
  presets: georgiewaterPresets,
};

export default georgiewater;
