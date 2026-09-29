import { z } from "zod";

import { Camera, Toggle } from "../args.ts";
import { command } from "../command.ts";
import { controlCamera, getCamera } from "./util.ts";

const AUTOFOCUS = {
  on: "on",
  yes: "on",
  auto: "on",
  off: "off",
  no: "off",
} as const;

/**
 * A focus value in range, or "on"/"auto"/"off" to switch auto-focus instead,
 * which the legacy bot also accepted for these commands. Unlike `Toggle`,
 * "0" and "1" aren't treated as off/on here, as they're focus values.
 */
const FocusOrAutofocus = (min: number, max: number) =>
  z.union([
    z
      .string()
      .min(1)
      .pipe(z.coerce.number<string>().min(min).max(max))
      .transform((value) => ({ value })),
    z
      .string()
      .toLowerCase()
      .pipe(z.enum(Object.keys(AUTOFOCUS) as (keyof typeof AUTOFOCUS)[]))
      .transform((value) => ({ autofocus: AUTOFOCUS[value] })),
  ]);

export const ptzfocus = command({
  id: "ptzfocus",
  aliases: ["ptzsetfocusr"],
  description: "Change relative focus (-9999 to 9999)",
  permission: "user",
  arguments: [Camera, FocusOrAutofocus(-9999, 9999).describe("focus:number")],
  execute: async ([name, focus], context) => {
    const cam = await controlCamera(name, context);
    if ("autofocus" in focus)
      await cam.setAutofocus({ state: focus.autofocus });
    else await cam.focusBy({ value: focus.value });
  },
});

export const ptzfocusa = command({
  id: "ptzfocusa",
  aliases: ["ptzsetfocusa"],
  description: "Change absolute focus (1 to 9999)",
  permission: "user",
  arguments: [Camera, FocusOrAutofocus(1, 9999).describe("focus:number")],
  execute: async ([name, focus], context) => {
    const cam = await controlCamera(name, context);
    if ("autofocus" in focus)
      await cam.setAutofocus({ state: focus.autofocus });
    else await cam.setFocus({ value: focus.value });
  },
});

export const ptzcfocus = command({
  id: "ptzcfocus",
  description:
    "Continuously change focus (-100 to 100; 0 or off stops) (if supported)",
  permission: "operator",
  arguments: [
    Camera,
    z
      .string()
      .toLowerCase()
      .min(1)
      .transform((value) => (value === "off" ? "0" : value))
      .pipe(z.coerce.number<string>().min(-100).max(100))
      .describe("focus:number"),
  ],
  execute: async ([name, value], context) => {
    const cam = await controlCamera(name, context);
    await cam.focusContinuous({ value });
  },
});

export const ptzgetfocus = command({
  id: "ptzgetfocus",
  aliases: ["getfocus"],
  description: "Get the current focus (if supported)",
  permission: "user",
  arguments: [Camera],
  execute: async ([name]) => {
    const cam = await getCamera(name);
    const { focus, autofocus } = await cam.getPosition();
    if (focus === undefined) return;
    return `PTZ Focus (1-9999): ${focus} |af ${autofocus ?? "n/a"}`;
  },
});

export const ptzautofocus = command({
  id: "ptzautofocus",
  description: "Turn auto-focus on or off (if supported)",
  permission: "user",
  arguments: [Camera, Toggle()],
  execute: async ([name, state], context) => {
    const cam = await controlCamera(name, context);
    await cam.setAutofocus({ state });
  },
});

export default [ptzfocus, ptzfocusa, ptzcfocus, ptzgetfocus, ptzautofocus];
