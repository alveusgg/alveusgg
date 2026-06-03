import { z } from "zod";

import { BaseArrayItem, BaseSectionData } from "@/olon/lib/base-schemas";

export const ambassadorsCarouselSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  seeAllHref: z.string().describe("ui:text"),
  featured: z
    .array(
      BaseArrayItem.extend({
        key: z.string().describe("ui:text"),
        title: z.string().describe("ui:text"),
        description: z.string().describe("ui:textarea"),
      }),
    )
    .describe("ui:list"),
  support: z.object({
    heading: z.string().describe("ui:text"),
    body: z.string().describe("ui:textarea"),
    cta: z.object({
      label: z.string().describe("ui:text"),
      href: z.string().describe("ui:text"),
    }),
  }),
});
