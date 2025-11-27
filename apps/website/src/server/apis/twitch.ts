import { z } from "zod";

import { env } from "@/env";

import {
  ExpiredAccessTokenError,
  getClientCredentialsAccessToken,
} from "@/server/utils/oauth2";

export type AuthHeaders = {
  "Client-Id": string;
  Authorization: `Bearer ${string}`;
};

let authHeaders: AuthHeaders | null = null;

async function getApplicationAuthHeaders() {
  if (authHeaders !== null) {
    return authHeaders;
  }

  const clientId = env.TWITCH_CLIENT_ID;
  const clientSecret = env.TWITCH_CLIENT_SECRET;

  const accessToken = await getClientCredentialsAccessToken(
    "twitch",
    clientId,
    clientSecret,
  );
  if (accessToken === undefined) {
    throw Error("Twitch API: Could not obtain OAuth access token!");
  }

  authHeaders = {
    "Client-Id": clientId,
    Authorization: `Bearer ${accessToken}`,
  };

  return authHeaders;
}

async function getUserAuthHeaders(userAccessToken: string) {
  const clientId = env.TWITCH_CLIENT_ID;

  authHeaders = {
    "Client-Id": clientId,
    Authorization: `Bearer ${userAccessToken}`,
  };

  return authHeaders;
}

const paginationSchema = z.object({ cursor: z.string().optional() });

const channelsFollowedResponseSchema = z.object({
  total: z.number(),
  data: z.array(
    z.object({
      broadcaster_id: z.string(),
      broadcaster_login: z.string(),
      broadcaster_name: z.string(),
      followed_at: z.string(),
    }),
  ),
  pagination: paginationSchema,
});

export async function getUserChannelsFollowed(
  userAccessToken: string,
  userId: string,
  broadcasterId?: string,
) {
  const params = [["user_id", userId]];

  if (broadcasterId) {
    params.push(["broadcaster_id", broadcasterId]);
  }

  const response = await fetch(
    `https://api.twitch.tv/helix/channels/followed?${new URLSearchParams(
      params,
    )}`,
    {
      method: "GET",
      headers: {
        ...(await getUserAuthHeaders(userAccessToken)),
      },
    },
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Could not get channel follows status!");
  }

  return channelsFollowedResponseSchema.parseAsync(json);
}

export async function getUserFollowsBroadcaster(
  userAccessToken: string,
  userId: string,
  broadcasterId: string,
) {
  try {
    const res = await getUserChannelsFollowed(
      userAccessToken,
      userId,
      broadcasterId,
    );
    if (res.total > 0) {
      return true;
    }
  } catch (e) {
    console.error(e);
    return true;
  }

  return false;
}

const userSubscribedToResponseSchema = z.object({
  data: z
    .array(
      z
        .object({
          broadcaster_id: z.string(),
          broadcaster_login: z.string(),
          broadcaster_name: z.string(),
          tier: z.literal(["1000", "2000", "3000"]),
        })
        .and(
          z.discriminatedUnion("is_gift", [
            z.object({
              is_gift: z.literal(false),
            }),
            z.object({
              is_gift: z.literal(true),
              gifter_id: z.string(),
              gifter_login: z.string(),
              gifter_name: z.string(),
            }),
          ]),
        ),
    )
    .length(1),
});

export async function getUserSubscribedToBroadcaster(
  userAccessToken: string,
  userId: string,
  broadcasterId: string,
) {
  const response = await fetch(
    `https://api.twitch.tv/helix/subscriptions/user?${new URLSearchParams({
      user_id: userId,
      broadcaster_id: broadcasterId,
    })}`,
    {
      method: "GET",
      headers: {
        ...(await getUserAuthHeaders(userAccessToken)),
      },
    },
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  if (response.status === 404) {
    return false;
  }

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Could not get subscription status!");
  }

  const data = await userSubscribedToResponseSchema.parseAsync(json);
  return data.data[0]!;
}

const usersSubscribedToResponseSchema = z.object({
  data: z.array(
    z
      .object({
        broadcaster_id: z.string(),
        broadcaster_login: z.string(),
        broadcaster_name: z.string(),
        tier: z.literal(["1000", "2000", "3000"]),
      })
      .and(
        z.discriminatedUnion("is_gift", [
          z.object({
            is_gift: z.literal(false),
          }),
          z.object({
            is_gift: z.literal(true),
            gifter_id: z.string(),
            gifter_login: z.string(),
            gifter_name: z.string(),
          }),
        ]),
      ),
  ),
  pagination: paginationSchema,
  total: z.number(),
  points: z.number(),
});

export async function getUsersSubscribedToBroadcaster(
  userAccessToken: string,
  broadcasterId: string,
  first?: number,
  after?: string,
) {
  const params = new URLSearchParams({
    broadcaster_id: broadcasterId,
  });
  if (first) params.append("first", first.toString());
  if (after) params.append("after", after);

  const response = await fetch(
    `https://api.twitch.tv/helix/subscriptions?${params}`,
    {
      method: "GET",
      headers: {
        ...(await getUserAuthHeaders(userAccessToken)),
      },
    },
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Could not get subscriptions!");
  }

  return usersSubscribedToResponseSchema.parseAsync(json);
}

const usersResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      login: z.string(),
      display_name: z.string(),
      type: z.literal(["staff", "admin", "global_mod", ""]),
      broadcaster_type: z.literal(["partner", "affiliate", ""]),
      description: z.string(),
      profile_image_url: z.string(),
      offline_image_url: z.string(),
      view_count: z.number(),
      email: z.email().optional(),
      created_at: z.string(),
    }),
  ),
});

export async function getUserByName(userName: string) {
  const response = await fetch(
    `https://api.twitch.tv/helix/users?${new URLSearchParams({
      login: userName,
    })}`,
    {
      method: "GET",
      headers: {
        ...(await getApplicationAuthHeaders()),
      },
    },
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Could not get broadcaster name!");
  }

  const data = await usersResponseSchema.parseAsync(json);
  return data.data[0];
}

const scheduleSegmentSchema = z.object({
  id: z.string(),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
  title: z.string(),
  canceled_until: z.iso.datetime().nullable(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  is_recurring: z.boolean(),
});

export type ScheduleSegment = z.infer<typeof scheduleSegmentSchema>;

const channelScheduleResponseSchema = z.object({
  data: z.object({
    segments: z.array(scheduleSegmentSchema).nullable(),
    broadcaster_id: z.string(),
    broadcaster_name: z.string(),
    vacation: z
      .object({
        start_time: z.iso.datetime(),
        end_time: z.iso.datetime(),
      })
      .nullable(),
  }),
  pagination: paginationSchema,
});

export async function getScheduleSegments(
  userAccessToken: string,
  userId: string,
  startDate: Date,
  after?: string,
) {
  const params = new URLSearchParams({
    broadcaster_id: userId,
    start_time: startDate.toISOString(),
    first: "25",
  });

  if (after) params.append("after", after);

  const response = await fetch(
    `https://api.twitch.tv/helix/schedule?${params}`,
    {
      method: "GET",
      headers: {
        ...(await getUserAuthHeaders(userAccessToken)),
      },
    },
  );

  const json = await response.json();
  if (response.status === 404) {
    return null;
  }

  if (response.status !== 200) {
    console.error(json);
    throw new Error("Failed to get schedule segments!");
  }

  return channelScheduleResponseSchema.parseAsync(json);
}

const createScheduleResponseSchema = z.object({
  data: z.object({
    segments: z.array(scheduleSegmentSchema).length(1),
    broadcaster_id: z.string(),
    broadcaster_name: z.string(),
    vacation: z
      .object({
        start_time: z.iso.datetime(),
        end_time: z.iso.datetime(),
      })
      .nullable(),
  }),
});

export async function createScheduleSegment(
  userAccessToken: string,
  userId: string,
  start: Date,
  timezone: string,
  duration: number,
  title: string,
  category?: number,
) {
  const response = await fetch(
    `https://api.twitch.tv/helix/schedule/segment?${new URLSearchParams({
      broadcaster_id: userId,
    })}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getUserAuthHeaders(userAccessToken)),
      },
      body: JSON.stringify({
        start_time: start.toISOString(),
        timezone,
        duration: duration.toString(),
        title,
        category_id: category?.toString(),
        is_recurring: false,
      }),
    },
  );

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Failed to create schedule segment!");
  }

  const data = await createScheduleResponseSchema.parseAsync(json);
  return data?.data?.segments?.[0];
}

export async function removeScheduleSegment(
  userAccessToken: string,
  userId: string,
  segmentId: string,
) {
  const response = await fetch(
    `https://api.twitch.tv/helix/schedule/segment?${new URLSearchParams({
      broadcaster_id: userId,
      id: segmentId,
    })}`,
    {
      method: "DELETE",
      headers: {
        ...(await getUserAuthHeaders(userAccessToken)),
      },
    },
  );

  if (response.status !== 204) {
    const json = await response.json();
    console.error(json);
    throw new Error("Failed to delete schedule segment!");
  }
}

const clipSchema = z.object({
  id: z.string(),
  url: z.string(),
  embed_url: z.string(),
  broadcaster_id: z.string(),
  broadcaster_name: z.string(),
  creator_id: z.string(),
  creator_name: z.string(),
  video_id: z.string(),
  game_id: z.string(),
  language: z.string(),
  title: z.string(),
  view_count: z.number(),
  created_at: z.iso.datetime(),
  thumbnail_url: z.string(),
  duration: z.number(),
  vod_offset: z.number().nullable(),
  is_featured: z.boolean(),
});

export type Clip = z.infer<typeof clipSchema>;

const clipsResponseSchema = z.object({
  data: z.array(clipSchema),
  pagination: paginationSchema,
});

export async function getClips(
  userAccessToken: string,
  userId: string,
  startDate?: Date,
  endDate?: Date,
  after?: string,
) {
  const params = new URLSearchParams({
    broadcaster_id: userId,
    first: "100",
  });

  if (startDate) params.append("started_at", startDate.toISOString());
  if (endDate) params.append("ended_at", endDate.toISOString());
  if (after) params.append("after", after);

  const response = await fetch(`https://api.twitch.tv/helix/clips?${params}`, {
    method: "GET",
    headers: {
      ...(await getUserAuthHeaders(userAccessToken)),
    },
  });

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Failed to get clips!");
  }

  return clipsResponseSchema.parseAsync(json);
}

export async function sendChatMessage(
  userAccessToken: string,
  userId: string,
  broadcasterId: string,
  message: string,
) {
  const response = await fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getUserAuthHeaders(userAccessToken)),
    },
    body: JSON.stringify({
      sender_id: userId,
      broadcaster_id: broadcasterId,
      message,
    }),
  });

  if (response.status !== 200) {
    const json = await response.json();
    console.error(json);
    throw new Error("Failed to send chat message!");
  }
}

const setupWebhookSubscriptionResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
    }),
  ),
});

export async function setupWebhookSubscriptionForBroadcaster(
  broadcasterUserId: string,
  type: string,
  version: string,
  callback: string,
  secret: string,
) {
  const accessToken = await getClientCredentialsAccessToken(
    "twitch",
    env.TWITCH_CLIENT_ID,
    env.TWITCH_CLIENT_SECRET,
  );
  if (accessToken === undefined) {
    throw new Error("Twitch API: Could not obtain OAuth access token!");
  }

  const headers = {
    "Content-Type": "application/json",
    "Client-Id": env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        type,
        version,
        condition: {
          broadcaster_user_id: broadcasterUserId,
        },
        transport: {
          method: "webhook",
          callback,
          secret,
        },
      }),
    },
  );

  if (response.status === 409) {
    return { result: "already_exists" };
  }

  if (response.status !== 202) {
    const json = await response.json();
    console.error(json);
    throw new Error(
      `Error creating webhook subscription ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();
  const data = await setupWebhookSubscriptionResponseSchema.parseAsync(json);
  if (data.data.length === 0) {
    throw new Error("No webhook subscription created!");
  }
  if (data.data.length > 1) {
    throw new Error("Multiple webhook subscriptions found!");
  }
  const subscription = data.data[0];
  if (!subscription) {
    throw new Error("Failed to setup webhook subscription!");
  }
  return { result: "success", subscription };
}
