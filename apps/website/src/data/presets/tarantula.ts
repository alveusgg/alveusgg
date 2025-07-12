import eva from "@/assets/presets/tarantula/eva.png";
import home from "@/assets/presets/tarantula/home.png";
import kiwi from "@/assets/presets/tarantula/kiwi.png";

import type { Preset } from "../tech/cameras.types";

const tarantulaPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  eva: {
    description: "Eva",
    image: eva,
  },
  kiwi: {
    description: "Kiwi",
    image: kiwi,
  },
};

const tarantula = {
  title: "Tarantula",
  group: "tarantula",
  presets: tarantulaPresets,
};

export default tarantula;
