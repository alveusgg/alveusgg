import { daysAgo } from "./helpers";
import { prisma } from "../index";

type SeedEntry = {
  id: string;
  authorEmail: string | null;
  displayName: string;
  title: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  // approved when approvedAt >= updatedAt, pending when null or older than updatedAt
  approvedAt: Date | null;
  seenOnStream: boolean;
  volunteeringMinutes: number | null;
  location?: { name: string; latitude: number; longitude: number };
  videoUrl?: string;
};

const entries: SeedEntry[] = [
  {
    id: "seed-sat-01",
    authorEmail: "seed-alice@example.com",
    displayName: "SeedAlice",
    title: "Squirrel feeder camera in my garden",
    text: "I set up a small feeder camera in my garden after watching the Alveus streams. This is example content seeded for local development, the video below shows the kind of clips I capture.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    approvedAt: daysAgo(3),
    seenOnStream: true,
    volunteeringMinutes: null,
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  },
  {
    id: "seed-sat-02",
    authorEmail: "seed-bob@example.com",
    displayName: "SeedBob",
    title: "Volunteered at a local wildlife rescue",
    text: "Spent the morning cleaning enclosures and preparing food at my local wildlife rescue. Example content seeded for local development.",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    approvedAt: daysAgo(2),
    seenOnStream: false,
    volunteeringMinutes: 90,
    location: {
      name: "Austin, Texas, USA",
      latitude: 30.2672,
      longitude: -97.7431,
    },
  },
  {
    id: "seed-sat-03",
    authorEmail: "seed-carol@example.com",
    displayName: "SeedCarol",
    title: "Pending post awaiting review",
    text: "This seeded entry has not been approved yet, so it should only be visible in the admin review queue.",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    approvedAt: null,
    seenOnStream: false,
    volunteeringMinutes: null,
  },
  {
    id: "seed-sat-04",
    authorEmail: "seed-alice@example.com",
    displayName: "SeedAlice",
    title: "Edited after approval",
    text: "This seeded entry was approved and then edited afterwards, so it returns to the review queue (approvedAt is older than updatedAt).",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
    approvedAt: daysAgo(5),
    seenOnStream: false,
    volunteeringMinutes: null,
  },
  {
    id: "seed-sat-05",
    authorEmail: null,
    displayName: "Anonymous Friend",
    title: "Anonymous bird feeder update",
    text: "An entry without a linked user account. Example content seeded for local development.",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
    approvedAt: daysAgo(10),
    seenOnStream: true,
    volunteeringMinutes: null,
  },
  {
    id: "seed-sat-06",
    authorEmail: "seed-bob@example.com",
    displayName: "SeedBob",
    title: "Give an Hour: park cleanup",
    text: "Joined a park cleanup for the Give an Hour campaign. Example content seeded for local development.",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
    approvedAt: daysAgo(14),
    seenOnStream: false,
    volunteeringMinutes: 60,
    location: { name: "Berlin, Germany", latitude: 52.52, longitude: 13.405 },
  },
  {
    id: "seed-sat-07",
    authorEmail: "seed-carol@example.com",
    displayName: "SeedCarol",
    title: "A longer story about my balcony garden",
    text: "This is a longer seeded entry to test how multi-paragraph posts render.\n\nOver the last few months I turned my balcony into a small pollinator garden with native flowers. The bees found it within days and now there is constant traffic all summer.\n\nIf you have even a small outdoor space, native plants make a huge difference for local insects and the birds that feed on them.",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
    approvedAt: daysAgo(60),
    seenOnStream: true,
    volunteeringMinutes: null,
  },
  {
    id: "seed-sat-08",
    authorEmail: "seed-alice@example.com",
    displayName: "SeedAlice",
    title: "Beach cleanup down under",
    text: "An older seeded entry to give the archive some history. We collected three bags of litter along the shoreline.",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    approvedAt: daysAgo(90),
    seenOnStream: true,
    volunteeringMinutes: 120,
    location: {
      name: "Sydney, Australia",
      latitude: -33.8688,
      longitude: 151.2093,
    },
  },
];

export async function seedShowAndTell(
  usersByEmail: Record<string, { id: string }>,
) {
  for (const entry of entries) {
    const userId = entry.authorEmail
      ? (usersByEmail[entry.authorEmail]?.id ?? null)
      : null;

    const data = {
      userId,
      title: entry.title,
      text: entry.text,
      displayName: entry.displayName,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      approvedAt: entry.approvedAt,
      seenOnStream: entry.seenOnStream,
      seenOnStreamAt: entry.seenOnStream ? entry.updatedAt : null,
      volunteeringMinutes: entry.volunteeringMinutes,
      location: entry.location?.name ?? null,
      latitude: entry.location?.latitude ?? null,
      longitude: entry.location?.longitude ?? null,
    };

    await prisma.showAndTellEntry.upsert({
      where: { id: entry.id },
      // Attachments are only created with the entry, updates leave them as-is
      create: {
        id: entry.id,
        ...data,
        ...(entry.videoUrl
          ? {
              attachments: {
                create: [
                  {
                    id: `${entry.id}-att-1`,
                    order: 0,
                    attachmentType: "video",
                    linkAttachment: {
                      create: {
                        id: `${entry.id}-link-1`,
                        type: "youtube",
                        url: entry.videoUrl,
                        title: "Video",
                        name: "Video",
                        caption: "",
                        alternativeText: "",
                        description: "",
                      },
                    },
                  },
                ],
              },
            }
          : {}),
      },
      update: data,
    });
  }

  console.log(`Seeded ${entries.length} show-and-tell entries`);
}
