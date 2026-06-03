import { z } from "zod";

import { BaseSectionData } from "@/olon/lib/base-schemas";

// Editorial copy only; species/IUCN/dates/enclosure/images/clips/Animal Quest
// are resolved from `key` in the View (they are data, not editable copy).
export const ambassadorProfileSchema = BaseSectionData.extend({
  key: z.string().describe("ui:text"),
  name: z.string().describe("ui:text"),
  alternate: z.array(z.string()).describe("ui:list"),
  story: z.string().describe("ui:textarea"),
  mission: z.string().describe("ui:textarea"),
  fact: z.string().nullable().describe("ui:textarea"),
});
