import chickenmulti from "@/assets/presets/chickenmulti.png";
import chinmulti from "@/assets/presets/chinmulti.png";
import crowincrowout from "@/assets/presets/crowincrowout.png";
import crowoutcrowin from "@/assets/presets/crowoutcrowin.png";
import foxmulti from "@/assets/presets/foxmulti.png";
import marmmulti from "@/assets/presets/marmmulti.png";
import wolfcwolfin from "@/assets/presets/wolfcwolfin.png";
import wolfden2multi from "@/assets/presets/wolfden2multi.png";
import wolfdenmulti from "@/assets/presets/wolfdenmulti.png";
import wolfmulti from "@/assets/presets/wolfmulti.png";
import wolfwolfin from "@/assets/presets/wolfwolfin.png";

import bb from "../presets/bb";
import chicken from "../presets/chicken";
import chickenindoor from "../presets/chickenindoor";
import chin from "../presets/chin";
import chin2 from "../presets/chin2";
import chin3 from "../presets/chin3";
import crowin from "../presets/crowin";
import crowout from "../presets/crowout";
import emu from "../presets/emu";
import fox from "../presets/fox";
import foxcorner from "../presets/foxcorner";
import garden from "../presets/garden";
import georgie from "../presets/georgie";
import georgiewater from "../presets/georgiewater";
import hank from "../presets/hank";
import littles from "../presets/littles";
import macaws from "../presets/macaws";
import marmin from "../presets/marmin";
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
import tarantula from "../presets/tarantula";
import tarantulaptz from "../presets/tarantulaptz";
import toast from "../presets/toast";
import toastcrunch from "../presets/toastcrunch";
import wolf from "../presets/wolf";
import wolfcorner from "../presets/wolfcorner";
import wolfden from "../presets/wolfden";
import wolfden2 from "../presets/wolfden2";
import wolfindoor from "../presets/wolfindoor";
import wolfswitch from "../presets/wolfswitch";
import type { CameraMulti, CameraPTZ } from "./cameras.types";

const cameras = {
  bb,
  chicken,
  chickenindoor,
  chickenmulti: {
    title: "Chicken Multi-View",
    group: "chicken",
    multi: {
      cameras: ["chicken", "chickenindoor"],
      image: chickenmulti,
      description: "Chicken camera with chicken indoor picture-in-picture",
    },
  },
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
  crowincrowout: {
    title: "Crow In/Out Multi-View",
    group: "crow",
    multi: {
      cameras: ["crowin", "crowout"],
      image: crowincrowout,
      description: "Crow indoor camera with crow outdoor picture-in-picture",
    },
  },
  crowoutcrowin: {
    title: "Crow Out/In Multi-View",
    group: "crow",
    multi: {
      cameras: ["crowout", "crowin"],
      image: crowoutcrowin,
      description: "Crow outdoor camera with crow indoor picture-in-picture",
    },
  },
  emu,
  fox,
  foxcorner,
  foxmulti: {
    title: "Fox Multi-View",
    group: "fox",
    multi: {
      cameras: ["fox", "foxcorner"],
      image: foxmulti,
      description: "Picture-in-picture of both fox cameras",
    },
  },
  garden,
  georgie,
  georgiewater,
  hank,
  marmin,
  marmout,
  marmmulti: {
    title: "Marmoset Multi-View",
    group: "marmoset",
    multi: {
      cameras: ["marmout", "marmin"],
      image: marmmulti,
      description:
        "Marmoset outdoor camera with marmoset indoor picture-in-picture",
    },
  },
  marty,
  noodle,
  littles,
  macaws,
  pasture,
  pasturefeeder,
  patchy,
  pushpop,
  pushpopcrunch,
  pushpopindoor,
  roaches,
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
  wolfcwolfin: {
    title: "Wolf Corner/In Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolfcorner", "wolfindoor"],
      image: wolfcwolfin,
      description: "Wolf corner camera with wolf indoor picture-in-picture",
    },
  },
  wolfden2multi: {
    title: "Wolf Den 2 Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolfcorner", "wolfden2"],
      image: wolfden2multi,
      description: "Wolf corner camera with wolf den 2 picture-in-picture",
    },
  },
  wolfdenmulti: {
    title: "Wolf Den Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolf", "wolfden"],
      image: wolfdenmulti,
      description: "Wolf camera with wolf den picture-in-picture",
    },
  },
  wolfmulti: {
    title: "Wolf Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolf", "wolfcorner"],
      image: wolfmulti,
      description: "Wolf camera with wolf corner picture-in-picture",
    },
  },
  wolfwolfin: {
    title: "Wolf/Wolf In Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolf", "wolfindoor"],
      image: wolfwolfin,
      description: "Wolf camera with wolf indoor picture-in-picture",
    },
  },
} as const satisfies Record<string, CameraPTZ | CameraMulti>;

export type Camera = keyof typeof cameras;
export default cameras;

export const isCameraPTZ = (
  cam: Camera | CameraPTZ | CameraMulti,
): cam is CameraPTZ =>
  typeof cam === "string" ? "presets" in cameras[cam] : "presets" in cam;
export const isCameraMulti = (
  cam: Camera | CameraPTZ | CameraMulti,
): cam is CameraMulti =>
  typeof cam === "string" ? "multi" in cameras[cam] : "multi" in cam;
