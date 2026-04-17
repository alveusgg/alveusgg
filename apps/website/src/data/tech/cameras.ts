import bb from "../presets/bb";
import chicken from "../presets/chicken";
import chickenindoor from "../presets/chickenindoor";
import chickenmulti from "../presets/chickenmulti";
import chin from "../presets/chin";
import chin2 from "../presets/chin2";
import chin3 from "../presets/chin3";
import chinmulti from "../presets/chinmulti";
import crowin from "../presets/crowin";
import crowincrowout from "../presets/crowincrowout";
import crowout from "../presets/crowout";
import crowoutcrowin from "../presets/crowoutcrowin";
import emu from "../presets/emu";
import fox from "../presets/fox";
import foxcovered from "../presets/foxcovered";
import foxindoor from "../presets/foxindoor";
import garden from "../presets/garden";
import georgie from "../presets/georgie";
import georgiewater from "../presets/georgiewater";
import hank from "../presets/hank";
import littles from "../presets/littles";
import littlesmulti from "../presets/littlesmulti";
import macaws from "../presets/macaws";
import macawsmulti from "../presets/macawsmulti";
import marmin from "../presets/marmin";
import marmmulti from "../presets/marmmulti";
import marmout from "../presets/marmout";
import marty from "../presets/marty";
import noodle from "../presets/noodle";
import pasture from "../presets/pasture";
import pasturefeeder from "../presets/pasturefeeder";
import patchy from "../presets/patchy";
import pushpop from "../presets/pushpop";
import pushpopcrunch from "../presets/pushpopcrunch";
import pushpopindoor from "../presets/pushpopindoor";
import roaches from "../presets/roaches";
import serval from "../presets/serval";
import tarantula from "../presets/tarantula";
import tarantulaptz from "../presets/tarantulaptz";
import toast from "../presets/toast";
import toastcrunch from "../presets/toastcrunch";
import wolf from "../presets/wolf";
import wolfcorner from "../presets/wolfcorner";
import wolfcornerwolfden2 from "../presets/wolfcornerwolfden2";
import wolfcornerwolfin from "../presets/wolfcornerwolfin";
import wolfden from "../presets/wolfden";
import wolfden2 from "../presets/wolfden2";
import wolfindoor from "../presets/wolfindoor";
import wolfswitch from "../presets/wolfswitch";
import wolfwolfcorner from "../presets/wolfwolfcorner";
import wolfwolfden from "../presets/wolfwolfden";
import wolfwolfin from "../presets/wolfwolfin";
import type { CameraMulti, CameraPTZ } from "./cameras.types";

const cameras = {
  bb,
  chicken,
  chickenindoor,
  chickenmulti,
  chin,
  chin2,
  chin3,
  chinmulti,
  crowin,
  crowout,
  crowincrowout,
  crowoutcrowin,
  emu,
  fox,
  foxcovered,
  foxindoor,
  garden,
  georgie,
  georgiewater,
  hank,
  marmin,
  marmout,
  marmmulti,
  marty,
  noodle,
  littles,
  littlesmulti,
  macaws,
  macawsmulti,
  pasture,
  pasturefeeder,
  patchy,
  pushpop,
  pushpopcrunch,
  pushpopindoor,
  roaches,
  serval,
  tarantula,
  tarantulaptz,
  toast,
  toastcrunch,
  wolf,
  wolfcorner,
  wolfden,
  wolfden2,
  wolfindoor,
  wolfswitch,
  wolfcornerwolfin,
  wolfcornerwolfden2,
  wolfwolfden,
  wolfwolfcorner,
  wolfwolfin,
} as const satisfies Record<string, CameraPTZ | CameraMulti>;

export type Camera = keyof typeof cameras;
export default cameras;
