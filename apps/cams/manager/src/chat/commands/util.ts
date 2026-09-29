import { exports } from "cloudflare:workers";

import { canBypassLock } from "../../permissions.ts";
import type { CommandContext } from "../command.ts";

export const controller = () =>
  exports.CamControllerDurableObject.getByName("default");

/**
 * Get a camera without taking control of it, for commands that only read from
 * it or touch its saved presets. These work on locked cameras.
 */
export const getCamera = (camera: string) =>
  controller().getByCameraName(camera);

/**
 * Take control of a camera to move it, respecting PTZ locks.
 */
export const controlCamera = async (
  camera: string,
  context: CommandContext,
) => {
  const lock = await controller().getLock(camera);
  if (lock && !canBypassLock(context.level, lock.level)) {
    throw new Error(`${camera} is locked`);
  }
  return getCamera(camera);
};
