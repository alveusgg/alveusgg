import { z } from "zod";

import { Camera, Numeric, Toggle } from "../args.ts";
import { command } from "../command.ts";
import { controlCamera, getCamera } from "./util.ts";

// `ptzzoom` zooms around the centre of a 1920x1080 frame, as the legacy bot did
const CENTER = { x: 960, y: 540 };

export const ptzpan = command({
  id: "ptzpan",
  description: "Change relative pan position",
  permission: "operator",
  arguments: [Camera, Numeric("angle")],
  execute: async ([name, degrees], context) => {
    const cam = await controlCamera(name, context);
    await cam.panBy({ degrees });
    await cam.setAutofocus({ state: "on" });
  },
});

export const ptztilt = command({
  id: "ptztilt",
  description: "Change relative tilt position",
  permission: "operator",
  arguments: [Camera, Numeric("angle")],
  execute: async ([name, degrees], context) => {
    const cam = await controlCamera(name, context);
    await cam.tiltBy({ degrees });
    await cam.setAutofocus({ state: "on" });
  },
});

export const ptzzoom = command({
  id: "ptzzoom",
  description:
    "Change the relative zoom level of a camera (greater than 100 zooms in, less than 100 zooms out)",
  permission: "user",
  arguments: [Camera, Numeric("zoom"), Toggle("autofocus").optional()],
  execute: async ([name, z, autofocus], context) => {
    const cam = await controlCamera(name, context);
    await cam.areaZoom({ ...CENTER, z });
    if (autofocus !== "off") await cam.setAutofocus({ state: "on" });
  },
});

export const ptzset = command({
  id: "ptzset",
  description: "Change relative pan/tilt/zoom position",
  permission: "operator",
  arguments: [Camera, Numeric("pan"), Numeric("tilt"), Numeric("zoom")],
  execute: async ([name, pan, tilt, zoom], context) => {
    const cam = await controlCamera(name, context);
    await cam.moveBy({ pan, tilt, zoom: zoom * 100 });
    await cam.setAutofocus({ state: "on" });
  },
});

export const ptzseta = command({
  id: "ptzseta",
  description:
    "Change absolute pan/tilt/zoom position, and optionally set auto-focus and focus",
  permission: "operator",
  arguments: [
    Camera,
    Numeric("pan"),
    Numeric("tilt"),
    Numeric("zoom"),
    Toggle().optional(),
    Numeric("focus").optional(),
  ],
  execute: async ([name, pan, tilt, zoom, autofocus, focus], context) => {
    const cam = await controlCamera(name, context);
    await cam.pointAt({ pan, tilt, zoom, focus });
    await cam.setAutofocus({ state: autofocus ?? "on" });
  },
});

export const ptzgetinfo = command({
  id: "ptzgetinfo",
  description: "Get the current pan/tilt/zoom, auto-focus and focus",
  permission: "user",
  arguments: [Camera],
  execute: async ([name]) => {
    const cam = await getCamera(name);
    const { pan, tilt, zoom, autofocus, focus } = await cam.getPosition();
    return `PTZ Info (${name}): ${pan}p |${tilt}t |${zoom}z |af ${autofocus ?? "n/a"} |${focus ?? "n/a"}f`;
  },
});

export const ptzmove = command({
  id: "ptzmove",
  description: "Move the camera in a direction",
  permission: "operator",
  arguments: [
    Camera,
    z
      .enum([
        "up",
        "down",
        "left",
        "right",
        "upleft",
        "upright",
        "downleft",
        "downright",
      ])
      .describe("direction:string"),
  ],
  execute: async ([name, direction], context) => {
    const cam = await controlCamera(name, context);
    await cam.move({ direction });
    await cam.setAutofocus({ state: "on" });
  },
});

export const ptzspin = command({
  id: "ptzspin",
  description: "Continuously move pan/tilt/zoom (0 0 0 stops)",
  permission: "operator",
  arguments: [Camera, Numeric("pan"), Numeric("tilt"), Numeric("zoom")],
  execute: async ([name, pan, tilt, zoom], context) => {
    const cam = await controlCamera(name, context);
    await cam.spin({ pan, tilt, zoom });
  },
});

export const ptzcenter = command({
  id: "ptzcenter",
  description: "Center the camera on an x,y position and change the zoom",
  permission: "operator",
  arguments: [Camera, Numeric("x"), Numeric("y"), Numeric("zoom")],
  execute: async ([name, x, y, zoom], context) => {
    const cam = await controlCamera(name, context);
    // Area zoom at 100 centres on the point without changing the zoom
    await cam.areaZoom({ x, y, z: 100 });
    if (zoom !== 0) await cam.zoomBy({ value: zoom });
    await cam.setAutofocus({ state: "on" });
  },
});

export const ptzareazoom = command({
  id: "ptzareazoom",
  description: "Center and zoom the camera on an x,y position",
  permission: "operator",
  arguments: [
    Camera,
    Numeric("x"),
    Numeric("y"),
    Numeric("zoom"),
    Toggle("autofocus").optional(),
  ],
  execute: async ([name, x, y, z, autofocus], context) => {
    const cam = await controlCamera(name, context);
    await cam.areaZoom({ x, y, z });
    if (autofocus !== "off") await cam.setAutofocus({ state: "on" });
  },
});

export const ptzspeed = command({
  id: "ptzspeed",
  description: "Change the absolute movement speed (or get it, with no speed)",
  permission: "operator",
  arguments: [Camera, Numeric("speed").optional()],
  execute: async ([name, speed], context) => {
    if (speed === undefined) {
      const cam = await getCamera(name);
      return `PTZ Speed: ${await cam.getSpeed()}`;
    }
    const cam = await controlCamera(name, context);
    await cam.setSpeed({ value: speed });
  },
});

export const ptzgetspeed = command({
  id: "ptzgetspeed",
  description: "Get the absolute movement speed",
  permission: "operator",
  arguments: [Camera],
  execute: async ([name]) => {
    const cam = await getCamera(name);
    return `PTZ Speed: ${await cam.getSpeed()}`;
  },
});

export default [
  ptzpan,
  ptztilt,
  ptzzoom,
  ptzset,
  ptzseta,
  ptzgetinfo,
  ptzmove,
  ptzspin,
  ptzcenter,
  ptzareazoom,
  ptzspeed,
  ptzgetspeed,
];
