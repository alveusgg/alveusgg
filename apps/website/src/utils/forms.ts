import { z } from "zod";

export type CalculatedFormConfig = z.infer<typeof formConfigSchema> & {
  hasRules: boolean;
};

export const formConfigSchema = z.object({
  checks: z.boolean().optional(),
  intro: z.string().optional(),
  rules: z.string().optional(),
  submitButtonText: z.string().optional(),
});

export const getDefaultFormConfig = () =>
  ({ checks: true, hasRules: false } satisfies CalculatedFormConfig);

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
