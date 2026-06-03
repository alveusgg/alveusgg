import { z } from "zod";

import { BaseSectionData } from "@/olon/lib/base-schemas";

export const whatIsAlveusSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  founder: z.string().describe("ui:text"),
  paragraphs: z.array(z.string()).describe("ui:list"),
  cta: z.object({
    label: z.string().describe("ui:text"),
    href: z.string().describe("ui:text"),
  }),
});
