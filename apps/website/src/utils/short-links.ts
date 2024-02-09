import { z } from "zod";

export const shortLinkConfigSchema = z.object({
  checks: z.boolean().optional(),
  requireShippingAddress: z.boolean().optional(),
  intro: z.string().optional(),
  rules: z.string().optional(),
  askMarketingEmails: z.boolean().optional(),
  askMarketingEmailsLabel: z.string().optional(),
});

/*export function calcFormConfig(formConfig?: string) {
  const config: CalculatedFormConfig = getDefaultFormConfig();
  if (formConfig) {
    const parsedConfig = formConfigSchema.safeParse(JSON.parse(formConfig));
    if (parsedConfig.success) {
      Object.assign(config, parsedConfig.data);
    }
  }

  config.hasRules = (config.rules && config.rules.trim() !== "") || false;

  return config;
}*/
