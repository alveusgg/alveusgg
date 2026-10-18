type StreamTheme = "default" | "christmas" | "halloween" | "wolf-week";
type StreamThemeOverride = "auto" | "default" | "wolf-week";

const monthlyThemes: Partial<Record<string, StreamTheme>> = {
  "10": "halloween",
  "12": "christmas",
};

// First matching event wins. End dates are exclusive, in Alveus time.
const themeSchedule: { start: string; end: string; theme: StreamTheme }[] = [
  { start: "2026-10-18", end: "2026-10-25", theme: "wolf-week" },
];

// Return themes in priority order so layouts can skip unavailable variants.
export const getStreamThemes = (
  date: string | null,
  override: StreamThemeOverride = "auto",
): StreamTheme[] => {
  const scheduledTheme = themeSchedule.find(
    ({ start, end }) => date !== null && date >= start && date < end,
  )?.theme;
  const overrides = {
    auto: scheduledTheme,
    default: undefined,
    "wolf-week": "wolf-week",
  } as const;

  return [
    overrides[override],
    monthlyThemes[date?.slice(5, 7) ?? ""],
    "default" as const,
  ].filter((theme) => theme !== undefined);
};
