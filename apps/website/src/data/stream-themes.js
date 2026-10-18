import { z } from "zod";

// Shared with env validation, which also runs outside the Next.js app.
export const monthlyThemes = /** @type {const} */ ({
  10: "halloween",
  12: "christmas",
});

// First matching event wins. End dates are exclusive, in Alveus time.
export const themeSchedule = /** @type {const} */ ([
  { start: "2026-10-18", end: "2026-10-25", theme: "wolf-week" },
]);

export const streamThemeOverrideSchema = z.literal([
  "auto",
  "default",
  ...Object.values(monthlyThemes),
  ...themeSchedule.map(({ theme }) => theme),
]);
