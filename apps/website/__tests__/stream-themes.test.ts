import { describe, expect, it } from "vitest";

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

  it("disables the event while preserving seasonal themes", () => {
    expect(getStreamThemes("2026-10-20", "default")).toEqual([
      "halloween",
      "default",
    ]);
    expect(getStreamThemes("2026-12-25", "default")).toEqual([
      "christmas",
      "default",
    ]);
  });

  it("forces the event outside its dates with seasonal fallbacks", () => {
    expect(getStreamThemes("2026-12-25", "wolf-week")).toEqual([
      "wolf-week",
      "christmas",
      "default",
    ]);
    expect(getStreamThemes(null, "wolf-week")).toEqual([
      "wolf-week",
      "default",
    ]);
  });
});
