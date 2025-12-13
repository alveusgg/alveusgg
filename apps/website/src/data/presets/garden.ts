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
    // modified: 2025-10-09T11:10:30.308Z
  },
  barn1r: {
    description: "Barn 1 Right",
    image: barn1r,
    // modified: 2025-10-09T11:10:30.312Z
  },
  barn2: {
    description: "Barn 2",
    image: barn2,
    // modified: 2025-10-09T11:10:30.308Z
  },
  bughotel: {
    description: "Bug Hotel",
    image: bughotel,
    // modified: 2025-10-09T11:10:30.316Z
  },
  bughotel2: {
    description: "Bug Hotel 2",
    image: bughotel2,
    // modified: 2025-10-09T11:10:30.320Z
  },
  gate: {
    description: "Gate",
    image: gate,
    // modified: 2025-10-09T11:10:30.312Z
  },
  katydidbughunt: {
    description: "katydidbughunt",
    image: katydidbughunt,
    // modified: 2025-10-23T03:00:00.316Z
  },
  pasturebrush: {
    description: "Pasture Brush",
    image: pasturebrush,
    // modified: 2025-10-09T11:10:30.316Z
  },
  pasturegrove: {
    description: "Pasture Grove",
    image: pasturegrove,
    // modified: 2025-10-09T11:10:30.316Z
  },
  pastureleft: {
    description: "Pasture Left",
    image: pastureleft,
    // modified: 2025-10-09T11:10:30.312Z
  },
  pasturepole: {
    description: "Pasture Pole",
    image: pasturepole,
    // modified: 2025-10-09T11:10:30.320Z
  },
  pastureright: {
    description: "Pasture Right",
    image: pastureright,
    // modified: 2025-10-09T11:10:30.312Z
  },
  pasturewater: {
    description: "Pasture Water",
    image: pasturewater,
    // modified: 2025-10-09T11:10:30.312Z
  },
  poolright: {
    description: "Pool Right",
    image: poolright,
    // modified: 2025-10-09T11:10:30.316Z
  },
  roundpen: {
    description: "Round Pen",
    image: roundpen,
    // modified: 2025-10-09T11:10:30.316Z
  },
  sunrise: {
    description: "Sunrise",
    image: sunrise,
    // modified: 2025-10-09T11:10:30.320Z
  },
  sunriser: {
    description: "sunriser",
    image: sunriser,
    // modified: 2025-12-02T13:19:23.489Z
  },
  tccenter: {
    description: "TC Center",
    image: tccenter,
    // modified: 2025-10-09T11:10:30.312Z
  },
  tcleft: {
    description: "TC Left",
    image: tcleft,
    // modified: 2025-10-09T11:10:30.312Z
  },
  tcright: {
    description: "TC Right",
    image: tcright,
    // modified: 2025-10-09T11:10:30.316Z
  },
};

const garden = {
  title: "Garden",
  group: "pasture",
  presets: gardenPresets,
};

export default garden;
