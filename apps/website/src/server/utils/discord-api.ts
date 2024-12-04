import { z } from "zod";

import { env } from "@/env";

// TODO: Move webhook logic from discord.ts to here
// TODO: Move all -api.ts files into dedicated directory

function getAuthHeaders() {
  return {
    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
  };
}

const scheduledEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  scheduled_start_time: z.string().datetime({ offset: true }),
  scheduled_end_time: z.string().datetime({ offset: true }),
  entity_type: z.number(),
  entity_metadata: z.object({
    location: z.string(),
  }), // TODO: What is this when not provided?
});

export async function getScheduledGuildEvents(guildId: string) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/scheduled-events`,
    {
      headers: getAuthHeaders(),
    },
  );

  const json = await response.json();
  if (response.status !== 200) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error("Failed to fetch guild events!");
  }

  return scheduledEventSchema.array().parseAsync(json);
}

export async function createScheduledGuildEvent(
  guildId: string,
  start: Date,
  end: Date,
  title: string,
  location: string,
  description?: string,
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/scheduled-events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        name: title,
        description,
        scheduled_start_time: start.toISOString(),
        scheduled_end_time: end.toISOString(),
        entity_type: 3, // external
        privacy_level: 2, // guild-only
        entity_metadata: { location },
      }),
    },
  );

  const json = await response.json();
  if (response.status !== 200) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error("Failed to create guild event!");
  }

  return scheduledEventSchema.parseAsync(json);
}
