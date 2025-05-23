import { type StaticImageData } from "next/image";

// import home from "@/assets/presets/wolfden/home.png";
// import rightcorner from "@/assets/presets/wolfden/rightcorner.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const wolfdenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    //image: home,
  },
  rightcorner: {
    description: "Right Corner",
    //image: rightcorner,
  },
};

const wolfden = {
  title: "Wolf Den",
  presets: wolfdenPresets,
};

export default wolfden;
