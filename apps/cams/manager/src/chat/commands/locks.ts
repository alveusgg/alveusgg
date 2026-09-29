import { z } from "zod";

import { canUnlock, hasLevel } from "../../permissions.ts";
import { parseDuration } from "../args.ts";
import { command } from "../command.ts";
import { controller } from "./util.ts";

const Token = z.string().describe("camera:string");

/** Split "!lockptz wolf pasture 10m" style arguments into cameras and a duration. */
const parseTargets = (tokens: string[]) => {
  const cameras = new Set<string>();
  let seconds: number | undefined;
  for (const value of tokens) {
    const duration = parseDuration(value);
    if (duration !== undefined) {
      seconds = duration;
      continue;
    }
    cameras.add(value);
  }
  return { cameras: [...cameras], seconds };
};

const listLocked = async () => {
  const locks = await controller().listLocks();
  if (locks.length === 0) return "Locked Cams: none";
  const cams = locks.map(
    ({ camera, level }) =>
      `${camera}(ptz${hasLevel(level, "superuser") ? "[S]" : ""})`,
  );
  return `Locked Cams: ${cams.join(", ")}`;
};

export const lockptz = command({
  id: "lockptz",
  aliases: ["lockptzcam", "lockcamptz", "ptzlock"],
  description:
    "Lock PTZ controls for users below your level, optionally for a time (e.g. 10m)",
  permission: "operator",
  arguments: [Token],
  rest: Token,
  execute: async (tokens, context) => {
    const { cameras, seconds } = parseTargets(tokens);
    if (cameras.length > 0) {
      await controller().lock(cameras, {
        user: context.user.login,
        level: context.level,
        until: seconds ? Date.now() + seconds * 1000 : null,
      });
    }
    return listLocked();
  },
});

export const unlockptz = command({
  id: "unlockptz",
  aliases: ["unlockcamptz", "unlockptzcam", "ptzunlock"],
  description: "Unlock PTZ controls",
  permission: "operator",
  arguments: [Token],
  rest: Token,
  execute: async (tokens, context) => {
    const targets = new Set(parseTargets(tokens).cameras);
    // Only remove locks set at or below the chatter's level, with "all"
    // covering every locked camera
    const unlockable = (await controller().listLocks())
      .filter(
        ({ camera, level }) =>
          (targets.has("all") || targets.has(camera)) &&
          canUnlock(context.level, level),
      )
      .map(({ camera }) => camera);
    if (unlockable.length > 0) await controller().unlock(unlockable);
    return listLocked();
  },
});

export const listlocked = command({
  id: "listlocked",
  aliases: [
    "listlock",
    "lockedlist",
    "locklist",
    "getlocked",
    "lockstatus",
    "lockedstatus",
    "lockedcams",
    "lockedcam",
    "locked",
    "ll",
  ],
  description: "List all locked cameras",
  permission: "user",
  arguments: [],
  execute: listLocked,
});

export default [lockptz, unlockptz, listlocked];
