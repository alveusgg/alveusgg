import { z } from "zod";

import { BaseArrayItem, BaseSectionData } from "@/olon/lib/base-schemas";

export const ambassadorsIndexSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  intro: z.string().describe("ui:textarea"),
  items: z
    .array(
      BaseArrayItem.extend({
        key: z.string().describe("ui:text"),
        name: z.string().describe("ui:text"),
        species: z.string().describe("ui:text"),
        // Sort/group attributes — a derived snapshot from @alveusgg/data so the
        // index sorts & groups entirely from the silo JSON (no data import at render).
        classification: z.object({
          slug: z.string(),
          name: z.string(),
          order: z.number(),
        }),
        enclosure: z.object({ slug: z.string(), name: z.string() }),
        arrival: z.string().nullable(),
      }),
    )
    .describe("ui:list"),
});
