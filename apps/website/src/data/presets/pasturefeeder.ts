import feeder from "@/assets/presets/pasturefeeder/feeder.png";
import home from "@/assets/presets/pasturefeeder/home.png";
import stompy from "@/assets/presets/pasturefeeder/stompy.png";

import type { Preset } from "../tech/cameras.types";

const pasturefeederPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.320Z
  },
  feeder: {
    description: "Feeder",
    image: feeder,
    // modified: 2025-10-09T11:10:30.320Z
  },
  stompy: {
    description: "Stompy feeder",
    image: stompy,
    // modified: 2025-10-09T11:10:30.320Z
  },
};

const pasturefeeder = {
  title: "Pasture Feeder",
  group: "pasture",
  presets: pasturefeederPresets,
};

export default pasturefeeder;
