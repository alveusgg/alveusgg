import { describe, expect, it } from "vitest";

import {
  type GiveAnHourEntry,
  summarizeGiveAnHourEntries,
} from "@/utils/give-an-hour";

const entry = (
  id: string,
  overrides: Partial<GiveAnHourEntry> = {},
): GiveAnHourEntry => ({
  id,
  userId: null,
  displayName: null,
  location: null,
  volunteeringMinutes: 60,
  ...overrides,
});

describe("summarizeGiveAnHourEntries", () => {
  it("counts campaign totals and geographic reach", () => {
    const stats = summarizeGiveAnHourEntries(
      [
        entry("one", {
          userId: "user-one",
          displayName: "Alice",
          location: "Austin, Texas, United States",
        }),
        entry("two", {
          userId: "user-one",
          displayName: "Alice Again",
          location: "Austin, Texas, United States",
          volunteeringMinutes: 30,
        }),
        entry("three", {
          displayName: "Bob",
          location: "Toronto, Ontario, Canada",
          volunteeringMinutes: 90,
        }),
        entry("four"),
      ],
      [],
    );

    expect(stats).toEqual({
      minutes: 240,
      hours: 4,
      posts: 4,
      participants: 2,
      firstTimeParticipants: 2,
      averageHoursPerParticipant: 2,
      locations: 2,
      countries: 2,
    });
  });

  it("recognizes returning participants by user ID or display name", () => {
    const stats = summarizeGiveAnHourEntries(
      [
        entry("returning-user", {
          userId: "returning-user",
          displayName: "A new display name",
        }),
        entry("returning-name", { displayName: "Returning Name" }),
        entry("new-user", {
          userId: "new-user",
          displayName: "New Participant",
        }),
      ],
      [
        { userId: "returning-user", displayName: "Old display name" },
        { userId: null, displayName: "Returning Name" },
      ],
    );

    expect(stats.participants).toBe(3);
    expect(stats.firstTimeParticipants).toBe(1);
  });

  it("does not mark a participant as new when any campaign post matches prior history", () => {
    const stats = summarizeGiveAnHourEntries(
      [
        entry("matched-name", {
          userId: "same-current-user",
          displayName: "Prior Name",
        }),
        entry("different-name", {
          userId: "same-current-user",
          displayName: "Different Name",
        }),
      ],
      [{ userId: null, displayName: "Prior Name" }],
    );

    expect(stats.participants).toBe(1);
    expect(stats.firstTimeParticipants).toBe(0);
  });
});
