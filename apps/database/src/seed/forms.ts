import { daysAgo, daysFromNow } from "./helpers";
import { prisma } from "../index";

// Config shape must satisfy formConfigSchema in apps/website/src/utils/forms.ts
type SeedForm = {
  slug: string;
  label: string;
  active: boolean;
  startAt: Date;
  endAt: Date | null;
  config: {
    checks?: boolean;
    requireShippingAddress?: boolean;
    intro?: string;
    rules?: string;
    submitButtonText?: string;
    askMarketingEmails?: boolean;
  };
};

const forms: SeedForm[] = [
  {
    slug: "seed-plushie-giveaway",
    label: "Plushie Giveaway (Seeded)",
    active: true,
    startAt: daysAgo(7),
    endAt: daysFromNow(14),
    config: {
      checks: true,
      requireShippingAddress: true,
      intro:
        "Example giveaway seeded for local development. Enter for a chance to win an ambassador plushie!",
      rules:
        "1. This is example content, no real giveaway is taking place.\n2. One entry per person.\n3. Winners are notified via email.",
      submitButtonText: "Enter giveaway",
      askMarketingEmails: true,
    },
  },
  {
    slug: "seed-upcoming-giveaway",
    label: "Upcoming Giveaway (Seeded)",
    active: true,
    startAt: daysFromNow(7),
    endAt: daysFromNow(21),
    config: {
      checks: true,
      requireShippingAddress: true,
      intro: "Example upcoming giveaway, entries have not opened yet.",
    },
  },
  {
    slug: "seed-closed-giveaway",
    label: "Closed Giveaway (Seeded)",
    active: true,
    startAt: daysAgo(30),
    endAt: daysAgo(7),
    config: {
      checks: true,
      requireShippingAddress: false,
      intro: "Example giveaway that has already ended.",
    },
  },
];

export async function seedForms() {
  for (const form of forms) {
    const data = {
      label: form.label,
      active: form.active,
      startAt: form.startAt,
      endAt: form.endAt,
      showInLists: true,
      config: JSON.stringify(form.config),
    };

    await prisma.form.upsert({
      where: { slug: form.slug },
      create: { slug: form.slug, ...data },
      update: data,
    });
  }

  console.log(`Seeded ${forms.length} forms`);
}
