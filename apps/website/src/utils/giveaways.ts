import { z } from "zod";

export type GiveawayConfig = z.infer<typeof giveawayConfigSchema>;

export const giveawayConfigSchema = z.object({
  checks: z.boolean().optional(),
  intro: z.string().optional(),
  rules: z.string().optional(),
  submitButtonText: z.string().optional(),
});

export const getDefaultGiveawayConfig = () =>
  ({ checks: true } satisfies GiveawayConfig);

export function calcGiveawayConfig(config?: string) {
  let mergedConfig: GiveawayConfig = getDefaultGiveawayConfig();
  if (config) {
    const parsedConfig = giveawayConfigSchema.safeParse(JSON.parse(config));
    if (parsedConfig.success) {
      mergedConfig = {
        ...mergedConfig,
        ...parsedConfig.data,
      };
    }
  }

  return mergedConfig;
}
