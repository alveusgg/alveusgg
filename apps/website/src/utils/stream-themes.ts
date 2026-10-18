import type { z } from "zod";

import {
  monthlyThemes,
  type streamThemeOverrideSchema,
  themeSchedule,
} from "@/data/stream-themes";

type StreamThemeOverride = z.infer<typeof streamThemeOverrideSchema>;
export type StreamTheme = Exclude<StreamThemeOverride, "auto">;

const themesByMonth: Partial<Record<string, StreamTheme>> = monthlyThemes;

// Return in priority order so layouts can skip unavailable themes
export const getStreamThemes = (
  date: string | null,
  override: StreamThemeOverride = "auto",
): StreamTheme[] => {
  let selectedTheme: StreamTheme | undefined;
  if (override === "auto") {
    if (date) {
      selectedTheme = themeSchedule.find(
        ({ start, end }) => date >= start && date < end,
      )?.theme;
    }
  } else if (override !== "default") {
    selectedTheme = override;
  }

  return [
    selectedTheme,
    themesByMonth[date?.slice(5, 7) ?? ""],
    "default" as const,
  ].filter((theme) => theme !== undefined);
};
