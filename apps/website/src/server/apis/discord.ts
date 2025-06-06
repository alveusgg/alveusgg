import { z } from "zod/v4";

import { env } from "@/env";

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
  scheduled_end_time: z.string().datetime({ offset: true }).nullable(),
  entity_type: z.number(),
  entity_metadata: z.object({
    location: z.string().optional(),
  }),
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
  {
    start,
    end,
    name,
    location,
    description,
  }: {
    start: Date;
    end: Date;
    name: string;
    location: string;
    description: string | null;
  },
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
        name,
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

export async function editScheduledGuildEvent(
  guildId: string,
  eventId: string,
  {
    start,
    end,
    name,
    location,
    description,
  }: {
    start?: Date;
    end?: Date;
    name?: string;
    location?: string;
    description?: string | null;
  },
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/scheduled-events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        name,
        description,
        scheduled_start_time: start?.toISOString(),
        scheduled_end_time: end?.toISOString(),
        entity_type: 3, // external
        privacy_level: 2, // guild-only
        entity_metadata: { location },
      }),
    },
  );

  const json = await response.json();
  if (response.status !== 200) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error("Failed to edit guild event!");
  }

  return scheduledEventSchema.parseAsync(json);
}

export async function removeScheduledGuildEvent(
  guildId: string,
  eventId: string,
) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/scheduled-events/${eventId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (response.status !== 204) {
    const json = await response.json();
    console.error(JSON.stringify(json, null, 2));
    throw new Error("Failed to delete guild event!");
  }
}
