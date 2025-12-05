import eva from "@/assets/presets/tarantulaptz/eva.png";
import evabottomleft from "@/assets/presets/tarantulaptz/evabottomleft.png";
import evabottomright from "@/assets/presets/tarantulaptz/evabottomright.png";
import evatopleft from "@/assets/presets/tarantulaptz/evatopleft.png";
import evatopright from "@/assets/presets/tarantulaptz/evatopright.png";
import home from "@/assets/presets/tarantulaptz/home.png";
import kiwi from "@/assets/presets/tarantulaptz/kiwi.png";
import kiwibottomleft from "@/assets/presets/tarantulaptz/kiwibottomleft.png";
import kiwibottomright from "@/assets/presets/tarantulaptz/kiwibottomright.png";
import kiwitopleft from "@/assets/presets/tarantulaptz/kiwitopleft.png";
import kiwitopright from "@/assets/presets/tarantulaptz/kiwitopright.png";
import tmp from "@/assets/presets/tarantulaptz/tmp.png";

import type { Preset } from "../tech/cameras.types";

const tarantulaptzPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
  },
  eva: {
    description: "Eva",
    image: eva,
  },
  evabottomleft: {
    description: "Eva Bottom Left",
    image: evabottomleft,
  },
  evabottomright: {
    description: "Eva Bottom Right",
    image: evabottomright,
  },
  evatopleft: {
    description: "Eva Top Left",
    image: evatopleft,
  },
  evatopright: {
    description: "Eva Top Right",
    image: evatopright,
  },
  kiwi: {
    description: "Kiwi",
    image: kiwi,
  },
  kiwibottomleft: {
    description: "Kiwi Bottom Left",
    image: kiwibottomleft,
  },
  kiwibottomright: {
    description: "Kiwi Bottom Right",
    image: kiwibottomright,
  },
  kiwitopleft: {
    description: "Kiwi Top Left",
    image: kiwitopleft,
  },
  kiwitopright: {
    description: "Kiwi Top Right",
    image: kiwitopright,
  },
  tmp: {
    description: "tmp",
    image: tmp,
  },
};

const tarantulaptz = {
  title: "Tarantula PTZ",
  group: "tarantula",
  presets: tarantulaptzPresets,
};

export default tarantulaptz;
