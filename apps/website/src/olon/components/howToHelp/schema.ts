import { z } from "zod";

import { BaseArrayItem, BaseSectionData } from "@/olon/lib/base-schemas";

export const howToHelpSchema = BaseSectionData.extend({
  heading: z.string().describe("ui:text"),
  items: z
    .array(
      BaseArrayItem.extend({
        icon: z.enum(["dollar", "amazon", "box"]).describe("ui:icon-picker"),
        title: z.string().describe("ui:text"),
        href: z.string().describe("ui:text"),
        external: z.boolean().optional().describe("ui:checkbox"),
      }),
    )
    .describe("ui:list"),
});
