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

import type { Preset } from "../tech/cameras.types";

const tarantulaptzPresets: Record<string, Preset> = {
  home: {
    description: "Home",
    image: home,
    // modified: 2025-10-09T11:10:30.304Z
  },
  eva: {
    description: "Eva",
    image: eva,
    // modified: 2025-10-09T11:10:30.300Z
  },
  evabottomleft: {
    description: "Eva Bottom Left",
    image: evabottomleft,
    // modified: 2025-10-09T11:10:30.304Z
  },
  evabottomright: {
    description: "Eva Bottom Right",
    image: evabottomright,
    // modified: 2025-10-09T11:10:30.304Z
  },
  evatopleft: {
    description: "Eva Top Left",
    image: evatopleft,
    // modified: 2025-10-09T11:10:30.304Z
  },
  evatopright: {
    description: "Eva Top Right",
    image: evatopright,
    // modified: 2025-10-09T11:10:30.304Z
  },
  kiwi: {
    description: "Kiwi",
    image: kiwi,
    // modified: 2025-10-09T11:10:30.300Z
  },
  kiwibottomleft: {
    description: "Kiwi Bottom Left",
    image: kiwibottomleft,
    // modified: 2025-10-09T11:10:30.300Z
  },
  kiwibottomright: {
    description: "Kiwi Bottom Right",
    image: kiwibottomright,
    // modified: 2025-10-09T11:10:30.304Z
  },
  kiwitopleft: {
    description: "Kiwi Top Left",
    image: kiwitopleft,
    // modified: 2025-10-09T11:10:30.304Z
  },
  kiwitopright: {
    description: "Kiwi Top Right",
    image: kiwitopright,
    // modified: 2025-10-09T11:10:30.304Z
  },
};

const tarantulaptz = {
  title: "Tarantula PTZ",
  group: "tarantula",
  presets: tarantulaptzPresets,
};

export default tarantulaptz;
