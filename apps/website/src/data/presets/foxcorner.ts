import { type StaticImageData } from "next/image";

import bowl from "@/assets/presets/foxcorner/bowl.png";
import den from "@/assets/presets/foxcorner/den.png";
import hillleft from "@/assets/presets/foxcorner/hillleft.png";
import hillright from "@/assets/presets/foxcorner/hillright.png";
import hillwide from "@/assets/presets/foxcorner/hillwide.png";
import home from "@/assets/presets/foxcorner/home.png";
import insidedoor from "@/assets/presets/foxcorner/insidedoor.png";
import table from "@/assets/presets/foxcorner/table.png";
import training from "@/assets/presets/foxcorner/training.png";

//import training2 from "@/assets/presets/foxcorner/training2.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const foxcornerPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  den: {
    description: "Den",
    image: den,
  },
  bowl: {
    description: "Bowl",
    image: bowl,
  },
  table: {
    description: "Table",
    image: table,
  },
  training: {
    description: "Training",
    image: training,
  },
  training2: {
    description: "Training 2",
    //image: training2,
  },
  hillleft: {
    description: "Hill Left",
    image: hillleft,
  },
  hillright: {
    description: "Hill Right",
    image: hillright,
  },
  hillwide: {
    description: "Hill Wide",
    image: hillwide,
  },
  insidedoor: {
    description: "Inside Door",
    image: insidedoor,
  },
};

const foxcorner = {
  title: "Fox Corner",
  presets: foxcornerPresets,
};

export default foxcorner;
