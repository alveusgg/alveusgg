import { type StaticImageData } from "next/image";

import home from "@/assets/presets/pushpopcrunch/home.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const pushpopcrunchPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
};

const pushpopcrunch = {
  title: "Pushpop Crunch",
  presets: pushpopcrunchPresets,
};

export default pushpopcrunch;
