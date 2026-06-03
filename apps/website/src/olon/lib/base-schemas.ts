import { z } from "zod";

// Base schema fragments (BSDS v1.1) authored in the app's zod 4.
// Core ships zod-3 BaseSectionData/BaseArrayItem; we re-author them here so tenant
// capsules compose with the app's zod 4 (the render path never hands these to core).

export const BaseSectionData = z.object({
  id: z.string().optional(),
  anchorId: z.string().optional().describe("ui:text"),
});

export const BaseArrayItem = z.object({
  id: z.string().optional(),
});

export const BaseSectionSettings = z.object({
  paddingTop: z
    .enum(["none", "sm", "md", "lg", "xl", "2xl"])
    .default("md")
    .describe("ui:select"),
  paddingBottom: z
    .enum(["none", "sm", "md", "lg", "xl", "2xl"])
    .default("md")
    .describe("ui:select"),
  theme: z.enum(["dark", "light", "accent"]).default("dark").describe("ui:select"),
  container: z.enum(["boxed", "fluid"]).default("boxed").describe("ui:select"),
});
