import { daysAgo, daysFromNow } from "./helpers";
import { prisma } from "../index";

const events = [
  {
    id: "cseedcal01",
    title: "Seed: Past stream",
    description: "Example past event seeded for local development.",
    category: "Alveus Regular Stream",
    link: "https://www.twitch.tv/alveussanctuary",
    startAt: daysAgo(4),
    hasTime: true,
  },
  {
    id: "cseedcal02",
    title: "Seed: Upcoming stream",
    description: "Example upcoming event seeded for local development.",
    category: "Alveus Regular Stream",
    link: "https://www.twitch.tv/alveussanctuary",
    startAt: daysFromNow(2),
    hasTime: true,
  },
  {
    id: "cseedcal03",
    title: "Seed: Community event",
    description: "Example all-day event seeded for local development.",
    category: "Community",
    link: "https://example.com/event",
    startAt: daysFromNow(9),
    hasTime: false,
  },
];

export async function seedCalendarEvents() {
  for (const { id, ...data } of events) {
    await prisma.calendarEvent.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }
  console.log(`Seeded ${events.length} calendar events`);
}
