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
    position: { pan: -89.1, tilt: -64.91, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
  eva: {
    description: "Eva",
    image: eva,
    position: { pan: -21.1, tilt: -57.11, zoom: 1 },
    // modified: 2025-10-09T11:10:30.300Z
  },
  evabottomleft: {
    description: "Eva Bottom Left",
    image: evabottomleft,
    position: { pan: -66.71, tilt: -53.85, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
  evabottomright: {
    description: "Eva Bottom Right",
    image: evabottomright,
    position: { pan: -32.35, tilt: -73.79, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
  evatopleft: {
    description: "Eva Top Left",
    image: evatopleft,
    position: { pan: -28.12, tilt: -44.28, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
  evatopright: {
    description: "Eva Top Right",
    image: evatopright,
    position: { pan: 6.23, tilt: -49.42, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
  kiwi: {
    description: "Kiwi",
    image: kiwi,
    position: { pan: -141.5, tilt: -55.01, zoom: 1 },
    // modified: 2025-10-09T11:10:30.300Z
  },
  kiwibottomleft: {
    description: "Kiwi Bottom Left",
    image: kiwibottomleft,
    position: { pan: -158.14, tilt: -71.51, zoom: 1 },
    // modified: 2025-10-09T11:10:30.300Z
  },
  kiwibottomright: {
    description: "Kiwi Bottom Right",
    image: kiwibottomright,
    position: { pan: -104.39, tilt: -55.95, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
  kiwitopleft: {
    description: "Kiwi Top Left",
    image: kiwitopleft,
    position: { pan: -168.45, tilt: -49.35, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
  kiwitopright: {
    description: "Kiwi Top Right",
    image: kiwitopright,
    position: { pan: -131.22, tilt: -43.57, zoom: 1 },
    // modified: 2025-10-09T11:10:30.304Z
  },
};

const tarantulaptz = {
  title: "Tarantula PTZ",
  group: "tarantula",
  presets: tarantulaptzPresets,
};

export default tarantulaptz;
