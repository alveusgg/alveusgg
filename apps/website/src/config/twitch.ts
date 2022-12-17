import { z } from "zod";

export type TwitchConfig = z.infer<typeof twitchConfigSchema>;
const twitchConfigSchema = z.object({
  channels: z.record(
    z.string(),
    z.object({
      id: z.coerce.string(),
      label: z.string(),
      notifications: z.object({
        live: z.boolean().optional(),
      }),
    })
  ),
});

const config: TwitchConfig = {
  channels: {
    maya: {
      id: "235835559",
      label: "Maya",
      notifications: {
        live: true,
      },
    },
    alveussanctuary: {
      id: "636587384",
      label: "AlveusSanctuary",
      notifications: {
        live: false,
      },
    },
    pjeweb: {
      id: "60734874",
      label: "pjeweb",
      notifications: {
        live: true,
      },
    },
  },
};

export async function getTwitchConfig() {
  return config;
}
