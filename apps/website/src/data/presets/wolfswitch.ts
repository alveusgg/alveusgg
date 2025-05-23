import { type StaticImageData } from "next/image";

// import back from "@/assets/presets/wolfswitch/back.png";
// import den from "@/assets/presets/wolfswitch/den.png";
// import dentop from "@/assets/presets/wolfswitch/dentop.png";
// import down from "@/assets/presets/wolfswitch/down.png";
// import downleft from "@/assets/presets/wolfswitch/downleft.png";
// import downright from "@/assets/presets/wolfswitch/downright.png";
// import farleft from "@/assets/presets/wolfswitch/farleft.png";
// import farright from "@/assets/presets/wolfswitch/farright.png";
// import home from "@/assets/presets/wolfswitch/home.png";
// import insidedoor from "@/assets/presets/wolfswitch/insidedoor.png";
// import pond from "@/assets/presets/wolfswitch/pond.png";
// import water from "@/assets/presets/wolfswitch/water.png";
// import denl from "@/assets/presets/wolfswitch/denl.png";
// import denr from "@/assets/presets/wolfswitch/denr.png";
// import middleleft from "@/assets/presets/wolfswitch/middleleft.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const wolfswitchPresets: Record<string, Preset> = {
  back: {
    description: "Back",
    //image: back,
  },
  den: {
    description: "Den",
    //image: den,
  },
  dentop: {
    description: "Den Top",
    //image: dentop,
  },
  down: {
    description: "Down",
    //image: down,
  },
  downleft: {
    description: "Down Left",
    //image: downleft,
  },
  downright: {
    description: "Down Right",
    //image: downright,
  },
  farleft: {
    description: "Far Left",
    //image: farleft,
  },
  farright: {
    description: "Far Right",
    //image: farright,
  },
  home: {
    description: "Home",
    //image: home,
  },
  insidedoor: {
    description: "Inside Door",
    //image: insidedoor,
  },
  pond: {
    description: "Pond",
    //image: pond,
  },
  water: {
    description: "Water",
    //image: water,
  },
  denl: {
    description: "Den Left",
    //image: denl,
  },
  denr: {
    description: "Den Right",
    //image: denr,
  },
  middleleft: {
    description: "Middle Left",
    //image: middleleft,
  },
  left: {
    description: "Left",
    //image: denl,
  },
};

const wolfswitch = {
  title: "Wolf Switch",
  presets: wolfswitchPresets,
};

export default wolfswitch;
