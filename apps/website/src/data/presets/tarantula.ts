import eva from "@/assets/presets/tarantula/eva.png";
import home from "@/assets/presets/tarantula/home.png";
import kiwi from "@/assets/presets/tarantula/kiwi.png";

import type { Preset } from "../tech/cameras.types";

const tarantulaPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-12-04T00:20:52.944Z
  },
  eva: {
    description: "Eva",
    image: eva,
    // modified: 2025-10-09T11:10:30.320Z
  },
  kiwi: {
    description: "Kiwi",
    image: kiwi,
    // modified: 2025-10-09T11:10:30.320Z
  },
};

const tarantula = {
  title: "Tarantula",
  group: "tarantula",
  presets: tarantulaPresets,
};

export default tarantula;
