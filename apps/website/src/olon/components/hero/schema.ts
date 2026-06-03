import { z } from "zod";

import { BaseArrayItem, BaseSectionData } from "@/olon/lib/base-schemas";

const ctaSchema = z.object({
  label: z.string().describe("ui:text"),
  href: z.string().describe("ui:text"),
});

export const heroSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  mission: z.string().describe("ui:textarea"),
  primaryCta: ctaSchema,
  twitchChannel: z.string().describe("ui:text"),
  institute: z.object({
    heading: z.string().describe("ui:text"),
    body: z.string().describe("ui:textarea"),
    ctas: z
      .array(BaseArrayItem.extend(ctaSchema.shape))
      .describe("ui:list"),
  }),
});
