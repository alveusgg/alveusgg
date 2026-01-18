import feeder from "@/assets/presets/pasturefeeder/feeder.png";
import home from "@/assets/presets/pasturefeeder/home.png";
import stompy from "@/assets/presets/pasturefeeder/stompy.png";

import type { Preset } from "../tech/cameras.types";

const pasturefeederPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    position: { pan: 65.42, tilt: 18.8, zoom: 3865 },
    // modified: 2025-10-09T11:10:30.320Z
  },
  feeder: {
    description: "Feeder",
    image: feeder,
    position: { pan: 58.39, tilt: 34.4, zoom: 6124 },
    // modified: 2025-10-09T11:10:30.320Z
  },
  stompy: {
    description: "Stompy feeder",
    image: stompy,
    position: { pan: 0, tilt: 0, zoom: 1 },
    // modified: 2025-10-09T11:10:30.320Z
  },
};

const pasturefeeder = {
  title: "Pasture Feeder",
  group: "pasture",
  presets: pasturefeederPresets,
};

export default pasturefeeder;
