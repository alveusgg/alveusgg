import { prisma } from "../index";

const shortLinks = [
  {
    slug: "seed-twitch",
    label: "Seed: Twitch channel",
    link: "https://www.twitch.tv/alveussanctuary",
  },
  {
    slug: "seed-website",
    label: "Seed: Alveus website",
    link: "https://www.alveussanctuary.org",
  },
  {
    slug: "seed-docs",
    label: "Seed: Documentation",
    link: "https://example.com/docs",
  },
];

export async function seedShortLinks() {
  for (const { slug, ...data } of shortLinks) {
    await prisma.shortLinks.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }
  console.log(`Seeded ${shortLinks.length} short links`);
}
