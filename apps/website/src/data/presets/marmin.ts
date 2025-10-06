import bowll from "@/assets/presets/marmin/bowll.png";
import bridgecl from "@/assets/presets/marmin/bridgecl.png";
import bridgel from "@/assets/presets/marmin/bridgel.png";
import bridgem from "@/assets/presets/marmin/bridgem.png";
import bridger from "@/assets/presets/marmin/bridger.png";
import center from "@/assets/presets/marmin/center.png";
import cornershelf from "@/assets/presets/marmin/cornershelf.png";
import domeleft from "@/assets/presets/marmin/domeleft.png";
import domeleftshelf from "@/assets/presets/marmin/domeleftshelf.png";
import domeright from "@/assets/presets/marmin/domeright.png";
import domerighttop from "@/assets/presets/marmin/domerighttop.png";
import down from "@/assets/presets/marmin/down.png";
import flapl from "@/assets/presets/marmin/flapl.png";
import flaps from "@/assets/presets/marmin/flaps.png";
import floor from "@/assets/presets/marmin/floor.png";
import home from "@/assets/presets/marmin/home.png";
import left from "@/assets/presets/marmin/left.png";
import leftw from "@/assets/presets/marmin/leftw.png";
import pole from "@/assets/presets/marmin/pole.png";
import right from "@/assets/presets/marmin/right.png";
import table from "@/assets/presets/marmin/table.png";
import win1 from "@/assets/presets/marmin/win1.png";
import win2 from "@/assets/presets/marmin/win2.png";
import win3 from "@/assets/presets/marmin/win3.png";
import win4 from "@/assets/presets/marmin/win4.png";
import windows from "@/assets/presets/marmin/windows.png";
import winl from "@/assets/presets/marmin/winl.png";
import winr from "@/assets/presets/marmin/winr.png";

import type { Preset } from "../tech/cameras.types";

const marminPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  bowll: {
    description: "Bowl Left",
    image: bowll,
  },
  bridgecl: {
    description: "Bridge Close Left",
    image: bridgecl,
  },
  bridgel: {
    description: "Bridge Left",
    image: bridgel,
  },
  bridgem: {
    description: "Bridge Middle",
    image: bridgem,
  },
  bridger: {
    description: "Bridge Right",
    image: bridger,
  },
  center: {
    description: "Center",
    image: center,
  },
  cornershelf: {
    description: "Corner Shelf",
    image: cornershelf,
  },
  domeleft: {
    description: "Dome Left",
    image: domeleft,
  },
  domeleftshelf: {
    description: "Dome Left Shelf",
    image: domeleftshelf,
  },
  domeright: {
    description: "Dome Right",
    image: domeright,
  },
  domerighttop: {
    description: "Dome Right Top",
    image: domerighttop,
  },
  down: {
    description: "Down",
    image: down,
  },
  flapl: {
    description: "Flap Left",
    image: flapl,
  },
  flaps: {
    description: "Flaps",
    image: flaps,
  },
  floor: {
    description: "Floor",
    image: floor,
  },
  left: {
    description: "Left",
    image: left,
  },
  leftw: {
    description: "Left Wall",
    image: leftw,
  },
  pole: {
    description: "Pole",
    image: pole,
  },
  right: {
    description: "Right",
    image: right,
  },
  table: {
    description: "Table",
    image: table,
  },
  win1: {
    description: "Window 1",
    image: win1,
  },
  win2: {
    description: "Window 2",
    image: win2,
  },
  win3: {
    description: "Window 3",
    image: win3,
  },
  win4: {
    description: "Window 4",
    image: win4,
  },
  winl: {
    description: "Window Left",
    image: winl,
  },
  winr: {
    description: "Window Right",
    image: winr,
  },
  windows: {
    description: "Windows",
    image: windows,
  },
};

const marmin = {
  title: "Marmoset Indoor",
  group: "marmoset",
  presets: marminPresets,
};

export default marmin;
