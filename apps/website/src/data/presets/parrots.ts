import { type StaticImageData } from "next/image";

import abovedoor from "@/assets/presets/parrots/abovedoor.png";
import bothwindows from "@/assets/presets/parrots/bothwindows.png";
import chicken from "@/assets/presets/parrots/chicken.png";
import door from "@/assets/presets/parrots/door.png";
import floor from "@/assets/presets/parrots/floor.png";
import floorl from "@/assets/presets/parrots/floorl.png";
import floorr from "@/assets/presets/parrots/floorr.png";
import home from "@/assets/presets/parrots/home.png";
import littles2 from "@/assets/presets/parrots/littles2.png";
import littles from "@/assets/presets/parrots/littles.png";
import littlesb from "@/assets/presets/parrots/littlesb.png";
import littlesbowl2 from "@/assets/presets/parrots/littlesbowl2.png";
import littlesbowl from "@/assets/presets/parrots/littlesbowl.png";
import littlessleep from "@/assets/presets/parrots/littlessleep.png";
import littlest from "@/assets/presets/parrots/littlest.png";
import littlesw from "@/assets/presets/parrots/littlesw.png";
import macaws from "@/assets/presets/parrots/macaws.png";
import macawsb from "@/assets/presets/parrots/macawsb.png";
import macawsbowl2 from "@/assets/presets/parrots/macawsbowl2.png";
import macawsbowl from "@/assets/presets/parrots/macawsbowl.png";
import macawst from "@/assets/presets/parrots/macawst.png";
import macawsw from "@/assets/presets/parrots/macawsw.png";
import platform1 from "@/assets/presets/parrots/platform1.png";
import platform2 from "@/assets/presets/parrots/platform2.png";
import tablet from "@/assets/presets/parrots/tablet.png";

//import littlesbowl3 from "@/assets/presets/parrots/littlesbowl3.png";
//import macawssleep from "@/assets/presets/parrots/macawssleep.png";
//import upleft from "@/assets/presets/parrots/upleft.png";
//import upright from "@/assets/presets/parrots/upright.png";
//import upmiddle from "@/assets/presets/parrots/upmiddle.png";

export interface Preset {
  description: string;
  image?: StaticImageData;
}

const parrotsPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  littles: {
    description: "Littles",
    image: littles,
  },
  littles2: {
    description: "Littles 2",
    image: littles2,
  },
  littlesb: {
    description: "Littles Bowl",
    image: littlesb,
  },
  littlesbowl: {
    description: "Littles Bowl",
    image: littlesbowl,
  },
  littlesbowl2: {
    description: "Littles Bowl 2",
    image: littlesbowl2,
  },
  littlessleep: {
    description: "Littles Sleep",
    image: littlessleep,
  },
  littlest: {
    description: "Littles T",
    image: littlest,
  },
  littlesw: {
    description: "Littles W",
    image: littlesw,
  },
  macaws: {
    description: "Macaws",
    image: macaws,
  },
  macawsb: {
    description: "Macaws Bowl",
    image: macawsb,
  },
  macawsbowl: {
    description: "Macaws Bowl",
    image: macawsbowl,
  },
  macawsbowl2: {
    description: "Macaws Bowl 2",
    image: macawsbowl2,
  },
  macawst: {
    description: "Macaws T",
    image: macawst,
  },
  macawsw: {
    description: "Macaws W",
    image: macawsw,
  },
  platform1: {
    description: "Platform 1",
    image: platform1,
  },
  platform2: {
    description: "Platform 2",
    image: platform2,
  },
  tablet: {
    description: "Tablet",
    image: tablet,
  },
  abovedoor: {
    description: "Above Door",
    image: abovedoor,
  },
  bothwindows: {
    description: "Both Windows",
    image: bothwindows,
  },
  chicken: {
    description: "Chicken",
    image: chicken,
  },
  door: {
    description: "Door",
    image: door,
  },
  floor: {
    description: "Floor",
    image: floor,
  },
  floorl: {
    description: "Floor Left",
    image: floorl,
  },
  floorr: {
    description: "Floor Right",
    image: floorr,
  },
  littlesbowl3: {
    description: "Littles Bowl 3",
    //image: littlesbowl3,
  },
  macawssleep: {
    description: "Macaws Sleep",
    //image: macawssleep,
  },
  upleft: {
    description: "Up Left",
    //image: upleft,
  },
  upright: {
    description: "Up Right",
    //image: upright,
  },
  upmiddle: {
    description: "Up Middle",
    //image: upmiddle,
  },
};

const parrot = {
  title: "Parrots",
  presets: parrotsPresets,
};

export default parrot;
