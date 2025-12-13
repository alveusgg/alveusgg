import barn1r from "@/assets/presets/garden/barn1r.png";
import barn2 from "@/assets/presets/garden/barn2.png";
import bughotel2 from "@/assets/presets/garden/bughotel2.png";
import bughotel from "@/assets/presets/garden/bughotel.png";
import gate from "@/assets/presets/garden/gate.png";
import home from "@/assets/presets/garden/home.png";
import katydidbughunt from "@/assets/presets/garden/katydidbughunt.png";
import pasturebrush from "@/assets/presets/garden/pasturebrush.png";
import pasturegrove from "@/assets/presets/garden/pasturegrove.png";
import pastureleft from "@/assets/presets/garden/pastureleft.png";
import pasturepole from "@/assets/presets/garden/pasturepole.png";
import pastureright from "@/assets/presets/garden/pastureright.png";
import pasturewater from "@/assets/presets/garden/pasturewater.png";
import poolright from "@/assets/presets/garden/poolright.png";
import roundpen from "@/assets/presets/garden/roundpen.png";
import sunrise from "@/assets/presets/garden/sunrise.png";
import sunriser from "@/assets/presets/garden/sunriser.png";
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
  bughotel2: {
    description: "Bug Hotel 2",
    image: bughotel2,
  },
  gate: {
    description: "Gate",
    image: gate,
  },
  katydidbughunt: {
    description: "katydidbughunt",
    image: katydidbughunt,
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
  pasturepole: {
    description: "Pasture Pole",
    image: pasturepole,
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
  sunrise: {
    description: "Sunrise",
    image: sunrise,
  },
  sunriser: {
    description: "sunriser",
    image: sunriser,
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
