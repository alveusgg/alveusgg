import barn1r from "@/assets/presets/garden/barn1r.png";
import barn2 from "@/assets/presets/garden/barn2.png";
import bughotel from "@/assets/presets/garden/bughotel.png";
import gate from "@/assets/presets/garden/gate.png";
import home from "@/assets/presets/garden/home.png";
import pasturebrush from "@/assets/presets/garden/pasturebrush.png";
import pasturegrove from "@/assets/presets/garden/pasturegrove.png";
import pastureleft from "@/assets/presets/garden/pastureleft.png";
import pastureright from "@/assets/presets/garden/pastureright.png";
import pasturewater from "@/assets/presets/garden/pasturewater.png";
import poolright from "@/assets/presets/garden/poolright.png";
import roundpen from "@/assets/presets/garden/roundpen.png";
import tccenter from "@/assets/presets/garden/tccenter.png";
import tcleft from "@/assets/presets/garden/tcleft.png";
import tcright from "@/assets/presets/garden/tcright.png";

import type { Preset } from "../tech/cameras.types";

const gardenPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  barn1r: {
    description: "Barn 1 Right",
    image: barn1r,
  },
  barn2: {
    description: "Barn 2",
    image: barn2,
  },
  bughotel: {
    description: "Bug Hotel",
    image: bughotel,
  },
  gate: {
    description: "Gate",
    image: gate,
  },
  pasturebrush: {
    description: "Pasture Brush",
    image: pasturebrush,
  },
  pasturegrove: {
    description: "Pasture Grove",
    image: pasturegrove,
  },
  pastureleft: {
    description: "Pasture Left",
    image: pastureleft,
  },
  pastureright: {
    description: "Pasture Right",
    image: pastureright,
  },
  pasturewater: {
    description: "Pasture Water",
    image: pasturewater,
  },
  poolright: {
    description: "Pool Right",
    image: poolright,
  },
  roundpen: {
    description: "Round Pen",
    image: roundpen,
  },
  tccenter: {
    description: "TC Center",
    image: tccenter,
  },
  tcleft: {
    description: "TC Left",
    image: tcleft,
  },
  tcright: {
    description: "TC Right",
    image: tcright,
  },
};

const garden = {
  title: "Garden",
  group: "pasture",
  presets: gardenPresets,
};

export default garden;
