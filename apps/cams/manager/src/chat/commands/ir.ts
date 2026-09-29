import { z } from "zod";

import { Camera, Toggle } from "../args.ts";
import { command } from "../command.ts";
import { controlCamera } from "./util.ts";

export const ptzir = command({
  id: "ptzir",
  description: "Change the IR sensor mode (if supported)",
  permission: "operator",
  arguments: [
    Camera,
    z
      .string()
      .toLowerCase()
      .transform((value) => {
        if (["on", "1", "yes"].includes(value)) return "on";
        if (["off", "0", "no"].includes(value)) return "off";
        return "auto";
      })
      .describe("mode:'on'|'off'|'auto'"),
  ],
  execute: async ([name, mode], context) => {
    const cam = await controlCamera(name, context);
    // IR "on" (night mode) means taking the IR cut filter out, and vice versa
    const filter = { on: "off", off: "on", auto: "auto" } as const;
    await cam.setIrFilter({ state: filter[mode] });
  },
});

export const ptzirlight = command({
  id: "ptzirlight",
  description: "Turn the built-in IR light on or off (if supported)",
  permission: "mod",
  arguments: [Camera, Toggle()],
  execute: async ([name, state], context) => {
    const cam = await controlCamera(name, context);
    await cam.setIrLight({ light: "led0", state });
  },
});

export default [ptzir, ptzirlight];
