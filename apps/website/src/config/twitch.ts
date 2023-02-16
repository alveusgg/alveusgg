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
        streamTitleChange: z.boolean().optional(),
        streamCategoryChange: z.boolean().optional(),
      }),
    })
  ),
});

const config = {
  channels: {
    //maya: {
    //  id: "235835559",
    //  label: "Maya",
    //  notifications: {
    //    live: false,
    //    streamTitleChange: false,
    //    streamCategoryChange: false,
    //  },
    //},
    alveussanctuary: {
      id: "636587384",
      label: "AlveusSanctuary",
      notifications: {
        live: false, // always live anyway
        streamTitleChange: true,
        streamCategoryChange: true,
      },
    },
    //pjeweb: {
    //  id: "60734874",
    //  label: "pjeweb",
    //  notifications: {
    //    live: true,
    //    streamTitleChange: true,
    //    streamCategoryChange: true,
    //  },
    //},
    alveusgg: {
      id: "858050963",
      label: "AlveusGG",
      notifications: {
        live: true,
        streamTitleChange: true,
        streamCategoryChange: true,
      },
    },
  },
} satisfies TwitchConfig;

export async function getChannelConfigById() {
  const twitchConfig: TwitchConfig = await getTwitchConfig();
  const channelConfigById: Record<string, TwitchConfig["channels"][string]> =
    {};
  for (const channelName in twitchConfig.channels) {
    const channelConfig = twitchConfig.channels[channelName];
    if (channelConfig) {
      channelConfigById[channelConfig.id] = channelConfig;
    }
  }
  return channelConfigById;
}

export async function getTwitchConfig() {
  return config;
}
