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
import littlesbowl3 from "@/assets/presets/parrots/littlesbowl3.png";
import littlesbowl from "@/assets/presets/parrots/littlesbowl.png";
import littlesbridge from "@/assets/presets/parrots/littlesbridge.png";
import littlessleep from "@/assets/presets/parrots/littlessleep.png";
import littlest from "@/assets/presets/parrots/littlest.png";
import littlesw from "@/assets/presets/parrots/littlesw.png";
import macaws from "@/assets/presets/parrots/macaws.png";
import macawsb from "@/assets/presets/parrots/macawsb.png";
import macawsbowl2 from "@/assets/presets/parrots/macawsbowl2.png";
import macawsbowl from "@/assets/presets/parrots/macawsbowl.png";
import macawssleep from "@/assets/presets/parrots/macawssleep.png";
import macawst from "@/assets/presets/parrots/macawst.png";
import macawsw from "@/assets/presets/parrots/macawsw.png";
import platform1 from "@/assets/presets/parrots/platform1.png";
import platform2 from "@/assets/presets/parrots/platform2.png";
import tablet from "@/assets/presets/parrots/tablet.png";
import upleft from "@/assets/presets/parrots/upleft.png";
import upmiddle from "@/assets/presets/parrots/upmiddle.png";
import upright from "@/assets/presets/parrots/upright.png";

import type { Preset } from "./preset";

const parrotsPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
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
    description: "chicken/bunny visit spot",
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
  littles: {
    description: "Littles tree",
    image: littles,
  },
  littles2: {
    description: "Littles branches near the window",
    image: littles2,
  },
  littlesb: {
    description: "Littles tree bottom",
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
  littlesbowl3: {
    description: "Littles Bowl 3",
    image: littlesbowl3,
  },
  littlesbridge: {
    description: "littles tree to abovedoor",
    image: littlesbridge,
  },
  littlessleep: {
    description: "Littles Sleep",
    image: littlessleep,
  },
  littlest: {
    description: "Littles tree top",
    image: littlest,
  },
  littlesw: {
    description: "Littles window",
    image: littlesw,
  },
  macaws: {
    description: "Macaws",
    image: macaws,
  },
  macawsb: {
    description: "Macaws bottom",
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
  macawssleep: {
    description: "Macaws Sleep",
    image: macawssleep,
  },
  macawst: {
    description: "Macaws top",
    image: macawst,
  },
  macawsw: {
    description: "Macaws window",
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
    description: "Tablet (smokee)",
    image: tablet,
  },
  upmiddle: {
    description: "Up Middle",
    image: upmiddle,
  },
  upleft: {
    description: "Up Left",
    image: upleft,
  },
  upright: {
    description: "Up Right",
    image: upright,
  },
};

const parrot = {
  title: "Parrots",
  presets: parrotsPresets,
};

export default parrot;
