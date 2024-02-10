import { z } from "zod";

export const shortLinkConfigSchema = z.object({
  checks: z.boolean().optional(),
  rules: z.string().optional(),
});
