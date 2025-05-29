import chinmulti from "@/assets/presets/chinmulti.png";

import chicken from "../presets/chicken";
import chickenindoor from "../presets/chickenindoor";
import chin from "../presets/chin";
import chin2 from "../presets/chin2";
import chin3 from "../presets/chin3";
import crowin from "../presets/crowin";
import crowout from "../presets/crowout";
import fox from "../presets/fox";
import foxcorner from "../presets/foxcorner";
import georgie from "../presets/georgie";
import georgiewater from "../presets/georgiewater";
import hank from "../presets/hank";
import marmin from "../presets/marmin";
import marmout from "../presets/marmout";
import noodle from "../presets/noodle";
import parrot from "../presets/parrots";
import pasture from "../presets/pasture";
import patchy from "../presets/patchy";
import pushpop from "../presets/pushpop";
import pushpopcrunch from "../presets/pushpopcrunch";
import pushpopindoor from "../presets/pushpopindoor";
import roaches from "../presets/roaches";
import toast from "../presets/toast";
import wolf from "../presets/wolf";
import wolfcorner from "../presets/wolfcorner";
import wolfden from "../presets/wolfden";
import wolfden2 from "../presets/wolfden2";
import wolfindoor from "../presets/wolfindoor";
import wolfswitch from "../presets/wolfswitch";
import type { CameraMulti, CameraPTZ } from "./cameras.types";

const cameras = {
  chicken,
  chickenindoor,
  chin,
  chin2,
  chin3,
  chinmulti: {
    title: "Chin Multi-View",
    group: "chin",
    multi: {
      cameras: ["chin", "chin2", "chin3"],
      image: chinmulti,
      description: "Picture-in-picture of all three chin cameras",
    },
  },
  crowin,
  crowout,
  fox,
  foxcorner,
  georgie,
  georgiewater,
  hank,
  marmin,
  marmout,
  noodle,
  parrot,
  pasture,
  patchy,
  pushpop,
  pushpopcrunch,
  pushpopindoor,
  roaches,
  toast,
  wolf,
  wolfcorner,
  wolfden,
  wolfden2,
  wolfindoor,
  wolfswitch,
} as const satisfies Record<string, CameraPTZ | CameraMulti>;

export type Camera = keyof typeof cameras;
export default cameras;
