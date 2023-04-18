import { z } from "zod";

export type CalculatedGiveawayConfig = z.infer<typeof giveawayConfigSchema> & {
  hasRules: boolean;
};

export const giveawayConfigSchema = z.object({
  checks: z.boolean().optional(),
  intro: z.string().optional(),
  rules: z.string().optional(),
  submitButtonText: z.string().optional(),
});

export const getDefaultGiveawayConfig = () =>
  ({ checks: true, hasRules: false } satisfies CalculatedGiveawayConfig);

export function calcGiveawayConfig(giveawayConfig?: string) {
  const config: CalculatedGiveawayConfig = getDefaultGiveawayConfig();
  if (giveawayConfig) {
    const parsedConfig = giveawayConfigSchema.safeParse(
      JSON.parse(giveawayConfig)
    );
    if (parsedConfig.success) {
      Object.assign(config, parsedConfig.data);
    }
  }

  config.hasRules = (config.rules && config.rules.trim() !== "") || false;

  return config;
}
