import { describe, expect, it } from "vitest";

import { streamThemeOverrideSchema } from "@/data/stream-themes";

import { getStreamThemes } from "@/utils/stream-themes";

describe("stream themes", () => {
  it.each([
    { date: null, expected: ["default"] },
    { date: "2026-10-17", expected: ["halloween", "default"] },
    {
      date: "2026-10-18",
      expected: ["wolf-week", "halloween", "default"],
    },
    {
      date: "2026-10-24",
      expected: ["wolf-week", "halloween", "default"],
    },
    { date: "2026-10-25", expected: ["halloween", "default"] },
    { date: "2025-10-20", expected: ["halloween", "default"] },
    { date: "2027-10-20", expected: ["halloween", "default"] },
    { date: "2026-12-25", expected: ["christmas", "default"] },
    { date: "2026-11-01", expected: ["default"] },
  ])("selects scheduled themes for $date", ({ date, expected }) => {
    expect(getStreamThemes(date)).toEqual(expected);
  });

  it("accepts a forced theme outside its usual dates", () => {
    expect(getStreamThemes(null, "wolf-week")).toEqual([
      "wolf-week",
      "default",
    ]);

    expect(getStreamThemes("2026-07-01", "christmas")).toEqual([
      "christmas",
      "default",
    ]);
  });

  it("includes any scheduled theme when an override is applied", () => {
    expect(getStreamThemes("2026-10-18", "christmas")).toEqual([
      "christmas",
      "wolf-week",
      "halloween",
      "default",
    ]);
  });

  it("accepts a forced default theme during any date", () => {
    expect(getStreamThemes("2026-07-01", "default")).toEqual(["default"]);
    expect(getStreamThemes("2026-12-25", "default")).toEqual(["default"]);
    expect(getStreamThemes(null, "default")).toEqual(["default"]);
  });

  it.each([
    { theme: undefined },
    { theme: "unknown" },
    { theme: "toString" },
    { theme: ["wolf-week", "auto"] },
  ])(
    "falls back to the configured theme for invalid URL value $theme",
    ({ theme }) => {
      expect(streamThemeOverrideSchema.catch("christmas").parse(theme)).toBe(
        "christmas",
      );
    },
  );
});
