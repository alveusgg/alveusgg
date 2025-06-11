import home from "@/assets/presets/pasturefeeder/home.png";
import stompy from "@/assets/presets/pasturefeeder/stompy.png";

import type { Preset } from "../tech/cameras.types";

const pasturefeederPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  stompy: {
    description: "Stompy feeder",
    image: stompy,
  },
};

const pasturefeeder = {
  title: "Pasture Feeder",
  group: "pasture",
  presets: pasturefeederPresets,
};

export default pasturefeeder;
