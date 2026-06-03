import { z } from "zod";

import { BaseSectionData } from "@/olon/lib/base-schemas";

const ctaSchema = z.object({
  label: z.string().describe("ui:text"),
  href: z.string().describe("ui:text"),
});

// Hybrid "island": editorial copy in JSON, the dynamic <MerchCarousel> stays in the View.
export const merchSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  intro: z.string().describe("ui:textarea"),
  merchCta: ctaSchema,
  plushiesHeading: z.string().describe("ui:text"),
  plushiesIntro: z.string().describe("ui:textarea"),
  plushiesCta: ctaSchema,
  proceeds: z.string().describe("ui:textarea"),
});
