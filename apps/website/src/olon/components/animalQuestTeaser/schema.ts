import { z } from "zod";

import { BaseSectionData } from "@/olon/lib/base-schemas";

export const animalQuestTeaserSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  body: z.string().describe("ui:textarea"),
  cta: z.object({
    label: z.string().describe("ui:text"),
    href: z.string().describe("ui:text"),
  }),
  latestLabel: z.string().describe("ui:text"),
});
