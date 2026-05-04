import { it, expect, describe } from "vitest";

import { fixDateTimezone, fixTimestampsTimezone } from "../utils";
import type { Timestamps } from "../schema";

const timezone = "America/Chicago";

describe("fixDateTimezone", () => {
  it("fixDateTimezone should convert to local timezone", () => {
    const timestamp = new Date("2024-01-01T12:00:00Z");
    const fixedDate = fixDateTimezone(timestamp, timezone);
    expect(fixedDate.toISOString()).toBe("2024-01-01T18:00:00.000Z");
  });

  it("fixDateTimezone should handle daylight saving time", () => {
    const timestamp = new Date("2024-06-01T12:00:00Z");
    const fixedDate = fixDateTimezone(timestamp, timezone);
    expect(fixedDate.toISOString()).toBe("2024-06-01T17:00:00.000Z");
  });
});

describe("fixTimestampsTimezone", () => {
  it("fixDateTimezone should convert to local timezone", () => {
    const timestampsObj = {
      createdDateTime: new Date("2024-01-01T12:00:00Z"),
      lastModifiedDateTime: new Date("2024-01-01T12:00:00Z"),
      createdBy: "Some Name",
      lastModifiedBy: "Some other Name",
    } as const satisfies Timestamps;
    const fixed = fixTimestampsTimezone(timestampsObj, timezone);
    expect(fixed.createdDateTime.toISOString()).toBe(
      "2024-01-01T18:00:00.000Z",
    );
    expect(fixed.lastModifiedDateTime.toISOString()).toBe(
      "2024-01-01T18:00:00.000Z",
    );
    expect(fixed.createdBy).toBe("Some Name");
    expect(fixed.lastModifiedBy).toBe("Some other Name");
  });
});
