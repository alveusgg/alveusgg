import { Camera, PresetName } from "../args.ts";
import { command } from "../command.ts";
import { controlCamera, getCamera } from "./util.ts";

export const ptzhome = command({
  id: "ptzhome",
  description: "Move the camera to its home position",
  permission: "user",
  arguments: [Camera],
  execute: async ([name], context) => {
    const cam = await controlCamera(name, context);
    await cam.load("home");
  },
});

export const ptzload = command({
  id: "ptzload",
  aliases: ["load"],
  description: "Move the camera to a saved preset",
  permission: "user",
  arguments: [Camera, PresetName()],
  execute: async ([name, preset], context) => {
    const cam = await controlCamera(name, context);
    await cam.load(preset);
  },
});

export const ptzsave = command({
  id: "ptzsave",
  description: "Save the camera's current position as a preset",
  permission: "operator",
  arguments: [Camera, PresetName()],
  execute: async ([name, preset]) => {
    const cam = await getCamera(name);
    await cam.save(preset);
  },
});

export const ptzremove = command({
  id: "ptzremove",
  description: "Remove a saved preset",
  permission: "operator",
  arguments: [Camera, PresetName()],
  execute: async ([name, preset], context) => {
    const cam = await controlCamera(name, context);
    await cam.removePreset(preset);
  },
});

export const ptzrename = command({
  id: "ptzrename",
  description: "Rename a saved preset",
  permission: "operator",
  arguments: [Camera, PresetName("old"), PresetName("new")],
  execute: async ([name, from, to]) => {
    const cam = await getCamera(name);
    await cam.renamePreset(from, to);
  },
});

export const ptzlist = command({
  id: "ptzlist",
  description: "List the camera's saved presets",
  permission: "user",
  arguments: [Camera],
  execute: async ([name]) => {
    const cam = await getCamera(name);
    const presets = await cam.listPresets();
    return `PTZ Presets: ${presets.join(", ")}`;
  },
});

export default [ptzhome, ptzload, ptzsave, ptzremove, ptzrename, ptzlist];
