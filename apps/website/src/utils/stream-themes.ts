import type { z } from "zod";

import {
  monthlyThemes,
  type streamThemeOverrideSchema,
  themeSchedule,
} from "@/data/stream-themes";

type StreamThemeOverride = z.infer<typeof streamThemeOverrideSchema>;
export type StreamTheme = Exclude<StreamThemeOverride, "auto">;

const themesByMonth: Partial<Record<string, StreamTheme>> = monthlyThemes;

// Return themes in priority order so layouts can skip unavailable variants.
export const getStreamThemes = (
  date: string | null,
  override: StreamThemeOverride = "auto",
): StreamTheme[] => {
  const scheduledTheme = themeSchedule.find(
    ({ start, end }) => date !== null && date >= start && date < end,
  )?.theme;
  let selectedTheme: StreamTheme | undefined;
  if (override === "auto") {
    selectedTheme = scheduledTheme;
  } else if (override !== "default") {
    selectedTheme = override;
  }

  return [
    selectedTheme,
    themesByMonth[date?.slice(5, 7) ?? ""],
    "default" as const,
  ].filter((theme) => theme !== undefined);
};
