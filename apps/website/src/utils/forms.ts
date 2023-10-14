import { z } from "zod";

export type CalculatedFormConfig = z.infer<typeof formConfigSchema> & {
  hasRules: boolean;
};

export const PLACEHOLDER_SUBMIT_BUTTON_TEXT = "Submit";
export const PLACEHOLDER_ASK_MARKETING_EMAILS_LABEL =
  "Additionally, I am happy for Alveus Sanctuary Inc. to use my email for direct marketing relating to the sanctuary, including from its partners, such as for news, fundraisers, and other promotions.";

export const formConfigSchema = z.object({
  checks: z.boolean().optional(),
  requireShippingAddress: z.boolean().optional(),
  intro: z.string().optional(),
  rules: z.string().optional(),
  submitButtonText: z.string().optional(),
  askMarketingEmails: z.boolean().optional(),
  askMarketingEmailsLabel: z.string().optional(),
});

export const getDefaultFormConfig = () =>
  ({
    checks: true,
    requireShippingAddress: true,
    hasRules: false,
    askMarketingEmails: false,
  }) satisfies CalculatedFormConfig;

export function calcFormConfig(formConfig?: string) {
  const config: CalculatedFormConfig = getDefaultFormConfig();
  if (formConfig) {
    const parsedConfig = formConfigSchema.safeParse(JSON.parse(formConfig));
    if (parsedConfig.success) {
      Object.assign(config, parsedConfig.data);
    }
  }

  config.hasRules = (config.rules && config.rules.trim() !== "") || false;

  return config;
}
