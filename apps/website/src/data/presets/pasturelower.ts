import bigbushytree from "@/assets/presets/pasturelower/bigbushytree.png";
import bigbushytreer from "@/assets/presets/pasturelower/bigbushytreer.png";
import down from "@/assets/presets/pasturelower/down.png";
import downleft from "@/assets/presets/pasturelower/downleft.png";
import downright from "@/assets/presets/pasturelower/downright.png";
import grove2 from "@/assets/presets/pasturelower/grove2.png";
import grove2l from "@/assets/presets/pasturelower/grove2l.png";
import grove2r from "@/assets/presets/pasturelower/grove2r.png";
import grove from "@/assets/presets/pasturelower/grove.png";
import grovel from "@/assets/presets/pasturelower/grovel.png";
import grover from "@/assets/presets/pasturelower/grover.png";
import home from "@/assets/presets/pasturelower/home.png";
import left from "@/assets/presets/pasturelower/left.png";
import owlbox from "@/assets/presets/pasturelower/owlbox.png";
import purplebasel from "@/assets/presets/pasturelower/purplebasel.png";
import purplenest from "@/assets/presets/pasturelower/purplenest.png";
import right from "@/assets/presets/pasturelower/right.png";
import rightcorner from "@/assets/presets/pasturelower/rightcorner.png";
import upperpasture from "@/assets/presets/pasturelower/upperpasture.png";

import type { Preset } from "../tech/cameras.types";

const pasturelowerPresets: Record<string, Preset> = {
  home: {
    description: "home",
    image: home,
    position: { pan: -74.39, tilt: 1.22, zoom: 1 },
    // modified: 2026-06-19T13:09:46.639Z
  },
  bigbushytree: {
    description: "bigbushytree",
    image: bigbushytree,
    position: { pan: -49.41, tilt: 1.79, zoom: 1 },
    // modified: 2026-06-19T13:41:44.295Z
  },
  bigbushytreer: {
    description: "bigbushytreer",
    image: bigbushytreer,
    position: { pan: -35.29, tilt: 0.78, zoom: 332 },
    // modified: 2026-06-19T13:42:24.695Z
  },
  down: {
    description: "down",
    image: down,
    position: { pan: -73.67, tilt: -22.08, zoom: 1 },
    // modified: 2026-06-19T13:29:46.151Z
  },
  downleft: {
    description: "downleft",
    image: downleft,
    position: { pan: -119.1, tilt: -17.66, zoom: 1 },
    // modified: 2026-06-19T13:28:46.762Z
  },
  downright: {
    description: "downright",
    image: downright,
    position: { pan: 3.42, tilt: -20.33, zoom: 1 },
    // modified: 2026-06-19T13:31:09.908Z
  },
  grove: {
    description: "grove",
    image: grove,
    position: { pan: -115.51, tilt: 0.5, zoom: 132 },
    // modified: 2026-06-19T13:14:50.612Z
  },
  grove2: {
    description: "grove2",
    image: grove2,
    position: { pan: -68.42, tilt: 4.61, zoom: 465 },
    // modified: 2026-06-19T13:33:54.551Z
  },
  grove2l: {
    description: "grove2l",
    image: grove2l,
    position: { pan: -72.73, tilt: 4.75, zoom: 864 },
    // modified: 2026-06-19T13:34:47.232Z
  },
  grove2r: {
    description: "grove2r",
    image: grove2r,
    position: { pan: -64.85, tilt: 4.32, zoom: 862 },
    // modified: 2026-06-19T13:36:39.266Z
  },
  grovel: {
    description: "grovel",
    image: grovel,
    position: { pan: -127.42, tilt: 0.29, zoom: 166 },
    // modified: 2026-06-19T13:38:57.644Z
  },
  grover: {
    description: "grover",
    image: grover,
    position: { pan: -95.47, tilt: 1.98, zoom: 166 },
    // modified: 2026-06-19T13:26:51.852Z
  },
  left: {
    description: "left",
    image: left,
    position: { pan: -108.56, tilt: 0.62, zoom: 1 },
    // modified: 2026-06-19T13:13:13.442Z
  },
  owlbox: {
    description: "owlbox",
    image: owlbox,
    position: { pan: -63.96, tilt: 6.07, zoom: 3659 },
    // modified: 2026-06-19T13:24:26.946Z
  },
  purplebasel: {
    description: "purplebasel",
    image: purplebasel,
    position: { pan: -86.32, tilt: 2.94, zoom: 665 },
    // modified: 2026-06-19T13:46:25.647Z
  },
  purplenest: {
    description: "purplenest",
    image: purplenest,
    position: { pan: -83, tilt: 8.2, zoom: 3205 },
    // modified: 2026-06-19T13:20:01.065Z
  },
  right: {
    description: "right",
    image: right,
    position: { pan: -16.57, tilt: -2.25, zoom: 1 },
    // modified: 2026-06-19T13:11:49.161Z
  },
  rightcorner: {
    description: "rightcorner",
    image: rightcorner,
    position: { pan: 12.46, tilt: -7.76, zoom: 1 },
    // modified: 2026-06-28T14:30:00.944Z
  },
  upperpasture: {
    description: "upperpasture",
    image: upperpasture,
    position: { pan: -79.93, tilt: 5.48, zoom: 847 },
    // modified: 2026-06-19T13:18:50.704Z
  },
};

const pasturelower = {
  title: "Pasture Lower",
  group: "pasture",
  presets: pasturelowerPresets,
};

export default pasturelower;
