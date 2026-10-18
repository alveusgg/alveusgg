import type { z } from "zod";

import {
  monthlyThemes,
  type streamThemeOverrideSchema,
  themeSchedule,
} from "@/data/stream-themes";

export type StreamTheme = z.infer<typeof streamThemeOverrideSchema>;

const themesByMonth: Partial<Record<string, StreamTheme>> = monthlyThemes;

// Return in priority order so layouts can skip unavailable themes
export const getStreamThemes = (
  date: string | null,
  override?: StreamTheme,
): StreamTheme[] => {
  // Every layout must have default, so short-circuit if that's the override
  if (override === "default") return ["default"];

  return [
    override,
    date
      ? themeSchedule.find(({ start, end }) => date >= start && date < end)
          ?.theme
      : undefined,
    date ? themesByMonth[date.slice(5, 7)] : undefined,
    "default" as const,
  ].filter((theme) => theme !== undefined);
};
