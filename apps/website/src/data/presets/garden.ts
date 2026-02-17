import barn1r from "@/assets/presets/garden/barn1r.png";
import barn2 from "@/assets/presets/garden/barn2.png";
import bughotel2 from "@/assets/presets/garden/bughotel2.png";
import bughotel from "@/assets/presets/garden/bughotel.png";
import gate from "@/assets/presets/garden/gate.png";
import home from "@/assets/presets/garden/home.png";
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
    position: { pan: 141.5, tilt: -16.98, zoom: 1 },
    // modified: 2025-10-09T11:10:30.308Z
  },
  barn1r: {
    description: "Barn 1 Right",
    image: barn1r,
    position: { pan: -133.31, tilt: -17.23, zoom: 432 },
    // modified: 2025-10-09T11:10:30.312Z
  },
  barn2: {
    description: "Barn 2",
    image: barn2,
    position: { pan: -135.55, tilt: -8.55, zoom: 3424 },
    // modified: 2025-10-09T11:10:30.308Z
  },
  bughotel: {
    description: "Bug Hotel",
    image: bughotel,
    position: { pan: 69.23, tilt: -7.73, zoom: 1262 },
    // modified: 2025-10-09T11:10:30.316Z
  },
  bughotel2: {
    description: "Bug Hotel 2",
    image: bughotel2,
    position: { pan: 158.68, tilt: -9.03, zoom: 6726 },
    // modified: 2025-10-09T11:10:30.320Z
  },
  gate: {
    description: "Gate",
    image: gate,
    position: { pan: -24.36, tilt: -3.94, zoom: 1 },
    // modified: 2025-10-09T11:10:30.312Z
  },
  pasturebrush: {
    description: "Pasture Brush",
    image: pasturebrush,
    position: { pan: -133.27, tilt: -10.64, zoom: 1048 },
    // modified: 2025-10-09T11:10:30.316Z
  },
  pasturegrove: {
    description: "Pasture Grove",
    image: pasturegrove,
    position: { pan: -128.09, tilt: -8.43, zoom: 1048 },
    // modified: 2025-10-09T11:10:30.316Z
  },
  pastureleft: {
    description: "Pasture Left",
    image: pastureleft,
    position: { pan: -136.44, tilt: -10.98, zoom: 193 },
    // modified: 2025-10-09T11:10:30.312Z
  },
  pasturepole: {
    description: "Pasture Pole",
    image: pasturepole,
    position: { pan: -89.6, tilt: -9.48, zoom: 591 },
    // modified: 2025-10-09T11:10:30.320Z
  },
  pastureright: {
    description: "Pasture Right",
    image: pastureright,
    position: { pan: -77.99, tilt: -9.6, zoom: 60 },
    // modified: 2025-10-09T11:10:30.312Z
  },
  pasturewater: {
    description: "Pasture Water",
    image: pasturewater,
    position: { pan: -100.08, tilt: -18.66, zoom: 689 },
    // modified: 2025-10-09T11:10:30.312Z
  },
  poolright: {
    description: "Pool Right",
    image: poolright,
    position: { pan: -85.44, tilt: -10.65, zoom: 664 },
    // modified: 2025-10-09T11:10:30.316Z
  },
  roundpen: {
    description: "Round Pen",
    image: roundpen,
    position: { pan: -99.47, tilt: -9.92, zoom: 664 },
    // modified: 2025-10-09T11:10:30.316Z
  },
  sunrise: {
    description: "Sunrise",
    image: sunrise,
    position: { pan: -150.16, tilt: 1.03, zoom: 1 },
    // modified: 2025-10-09T11:10:30.320Z
  },
  sunriser: {
    description: "sunriser",
    image: sunriser,
    position: { pan: -88.95, tilt: 1.4, zoom: 1 },
    // modified: 2025-12-02T13:19:23.489Z
  },
  tccenter: {
    description: "TC Center",
    image: tccenter,
    position: { pan: 54.61, tilt: -12.93, zoom: 1 },
    // modified: 2025-10-09T11:10:30.312Z
  },
  tcleft: {
    description: "TC Left",
    image: tcleft,
    position: { pan: 15.24, tilt: -7.74, zoom: 1 },
    // modified: 2025-10-09T11:10:30.312Z
  },
  tcright: {
    description: "TC Right",
    image: tcright,
    position: { pan: 107.8, tilt: -6.38, zoom: 154 },
    // modified: 2025-10-09T11:10:30.316Z
  },
};

const garden = {
  title: "Garden",
  group: "pasture",
  presets: gardenPresets,
};

export default garden;
