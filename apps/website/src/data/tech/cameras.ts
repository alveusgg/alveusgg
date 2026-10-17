import type { CameraMulti, CameraPTZ } from "./cameras.types";

// Presentation order and legacy chat-command slugs; preset content comes from the database.
const cameras = {
  bb: {
    title: "BB",
    group: "bb",
    presets: {},
  },
  chicken: {
    title: "Chicken",
    group: "chicken",
    presets: {},
  },
  chickenindoor: {
    title: "Chicken Indoor",
    group: "chicken",
    presets: {},
  },
  chickenmulti: {
    title: "Chicken Multi-View",
    group: "chicken",
    multi: {
      cameras: ["chicken", "chickenindoor"],
    },
  },
  chin: {
    title: "Chin Top",
    group: "chin",
    presets: {},
  },
  chin2: {
    title: "Chin Lower Left",
    group: "chin",
    presets: {},
  },
  chin3: {
    title: "Chin Lower Right",
    group: "chin",
    presets: {},
  },
  chinmulti: {
    title: "Chin Multi-View",
    group: "chin",
    multi: {
      cameras: ["chin3", "chin", "chin2"],
    },
  },
  crowin: {
    title: "Crow Indoor",
    group: "crow",
    presets: {},
  },
  crowout: {
    title: "Crow Outdoor",
    group: "crow",
    presets: {},
  },
  crowincrowout: {
    title: "Crow In + Out Multi-View",
    group: "crow",
    multi: {
      cameras: ["crowin", "crowout"],
    },
  },
  crowoutcrowin: {
    title: "Crow Out + In Multi-View",
    group: "crow",
    multi: {
      cameras: ["crowout", "crowin"],
    },
  },
  emu: {
    title: "Emu",
    group: "emu",
    presets: {},
  },
  emucover: {
    title: "Emu Cover",
    group: "emu",
    presets: {},
  },
  emupond: {
    title: "Emu Pond",
    group: "emu",
    presets: {},
  },
  fox: {
    title: "Fox",
    group: "fox",
    presets: {},
  },
  foxcovered: {
    title: "Fox Covered",
    group: "fox",
    presets: {},
  },
  foxindoor: {
    title: "Fox Indoor",
    group: "fox",
    presets: {},
  },
  garden: {
    title: "Garden",
    group: "pasture",
    presets: {},
  },
  georgie: {
    title: "Georgie",
    group: "georgie",
    presets: {},
  },
  georgiewater: {
    title: "Georgie Water",
    group: "georgie",
    presets: {},
  },
  marmin: {
    title: "Marmoset Indoor",
    group: "marmoset",
    presets: {},
  },
  marmout: {
    title: "Marmoset Outdoor",
    group: "marmoset",
    presets: {},
  },
  marmmulti: {
    title: "Marmoset Multi-View",
    group: "marmoset",
    multi: {
      cameras: ["marmout", "marmin"],
    },
  },
  marty: {
    title: "Marty",
    group: "marty",
    presets: {},
  },
  nature: {
    title: "Nature",
    group: "nature",
    presets: {},
  },
  noodle: {
    title: "Noodle",
    group: "noodle",
    presets: {},
  },
  littles: {
    title: "Littles",
    group: "parrot",
    presets: {},
  },
  littlesmulti: {
    title: "Littles + Macaws Multi-View",
    group: "parrot",
    multi: {
      cameras: ["littles", "macaws"],
    },
  },
  macaws: {
    title: "Macaws",
    group: "parrot",
    presets: {},
  },
  macawsmulti: {
    title: "Macaws + Littles Multi-View",
    group: "parrot",
    multi: {
      cameras: ["macaws", "littles"],
    },
  },
  pasture: {
    title: "Pasture",
    group: "pasture",
    presets: {},
  },
  pasturefeeder: {
    title: "Pasture Feeder",
    group: "pasture",
    presets: {},
  },
  pasturelower: {
    title: "Pasture Lower",
    group: "pasture",
    presets: {},
  },
  patchy: {
    title: "Patchy",
    group: "patchy",
    presets: {},
  },
  pushpop: {
    title: "Pushpop",
    group: "pushpop",
    presets: {},
  },
  pushpopcrunch: {
    title: "Pushpop Crunch",
    group: "pushpop",
    presets: {},
  },
  pushpopindoor: {
    title: "Pushpop Indoor",
    group: "pushpop",
    presets: {},
  },
  roaches: {
    title: "Roaches",
    group: "roaches",
    presets: {},
  },
  serval: {
    title: "Serval",
    group: "serval",
    presets: {},
  },
  servalindoor: {
    title: "Serval Indoor",
    group: "serval",
    presets: {},
  },
  tarantula: {
    title: "Tarantula",
    group: "tarantula",
    presets: {},
  },
  tarantulaptz: {
    title: "Tarantula PTZ",
    group: "tarantula",
    presets: {},
  },
  toast: {
    title: "Toast",
    group: "toast",
    presets: {},
  },
  toastcrunch: {
    title: "Toast Crunch",
    group: "toast",
    presets: {},
  },
  wolf: {
    title: "Wolf",
    group: "wolf",
    presets: {},
  },
  wolfcorner: {
    title: "Wolf Corner",
    group: "wolf",
    presets: {},
  },
  wolfden: {
    title: "Wolf Den",
    group: "wolf",
    presets: {},
  },
  wolfden2: {
    title: "Wolf Den 2",
    group: "wolf",
    presets: {},
  },
  wolfindoor: {
    title: "Wolf Indoor",
    group: "wolf",
    presets: {},
  },
  wolfswitch: {
    title: "Wolf Switch",
    group: "wolf",
    presets: {},
  },
  wolfcornerwolfin: {
    title: "Wolf Corner + In Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolfcorner", "wolfindoor"],
    },
  },
  wolfcornerwolfden2: {
    title: "Wolf Corner + Den 2 Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolfcorner", "wolfden2"],
    },
  },
  wolfwolfden: {
    title: "Wolf Den Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolf", "wolfden"],
    },
  },
  wolfwolfcorner: {
    title: "Wolf Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolf", "wolfcorner"],
    },
  },
  wolfwolfin: {
    title: "Wolf In Multi-View",
    group: "wolf",
    multi: {
      cameras: ["wolf", "wolfindoor"],
    },
  },
} as const satisfies Record<string, CameraPTZ | CameraMulti>;

export type Camera = keyof typeof cameras;
export default cameras;
