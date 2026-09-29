import type { User } from "./chat/types.ts";

// Highest first, matching the legacy chatbot's `commandPriority`
export const LEVELS = [
  "admin",
  "superuser",
  "mod",
  "operator",
  "vip",
  "user",
] as const;

export type Level = (typeof LEVELS)[number];

// Twitch logins, carried over from the legacy chatbot config
const ADMINS = ["spacevoyage", "maya", "theconnorobrien", "alveussanctuary"];
const SUPER_USERS = [
  "ellaandalex",
  "dionysus1911",
  "dannydv",
  "kayla_alveus",
  "phoenickes",
  "randishae83",
  "lindsay_alveus",
  "strickknine",
  "tarantulizer",
  "spiderdaynightlive",
  "srutiloops",
  "evantomology",
  "amandaexpress",
  "tamarinsandjulie",
  "chandlerirs",
  "rocky539",
  "thedoormandan",
  "lindengrows",
  "purplemartinconservation",
];
const OPERATORS: string[] = [];

const rank = (level: Level) => LEVELS.length - LEVELS.indexOf(level);

/** The highest level a chatter has, or `undefined` if they can't use commands. */
export const levelOf = (user: User): Level | undefined => {
  const login = user.login.toLowerCase();
  if (ADMINS.includes(login)) return "admin";
  if (SUPER_USERS.includes(login)) return "superuser";
  if (user.mod || user.broadcaster) return "mod";
  if (OPERATORS.includes(login)) return "operator";
  if (user.vip) return "vip";
  if (user.sub) return "user";
  return undefined;
};

export const hasLevel = (level: Level | undefined, required: Level) =>
  level !== undefined && rank(level) >= rank(required);

// Admins and super users are treated as equals when it comes to locks
const lockRank = (level: Level) => Math.min(rank(level), rank("superuser"));

/**
 * Whether a chatter can use a camera that someone else has locked. Super users
 * (and admins) can always get through; everyone else needs a higher level than
 * whoever set the lock.
 */
export const canBypassLock = (level: Level, lockedBy: Level) =>
  lockRank(level) === rank("superuser") || lockRank(level) > lockRank(lockedBy);

/** Whether a chatter can remove a lock: same level or higher. */
export const canUnlock = (level: Level, lockedBy: Level) =>
  lockRank(level) >= lockRank(lockedBy);
