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

const usersResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      login: z.string(),
      display_name: z.string(),
      type: z.enum(["staff", "admin", "global_mod", ""]),
      broadcaster_type: z.enum(["partner", "affiliate", ""]),
      description: z.string(),
      profile_image_url: z.string(),
      offline_image_url: z.string(),
      view_count: z.number(),
      email: z.string().email().optional(),
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
  return data?.data?.[0];
}

const scheduleResponseSchema = z.object({
  data: z.object({
    segments: z.array(
      z.object({
        id: z.string(),
        start_time: z.string().datetime(),
        end_time: z.string().datetime(),
        title: z.string(),
        canceled_until: z.string().datetime().nullable(),
        category: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .nullable(),
        is_recurring: z.boolean(),
      }),
    ),
  }),
});

const channelScheduleResponseSchema = scheduleResponseSchema.extend({
  data: scheduleResponseSchema.shape.data.extend({
    broadcaster_id: z.string(),
    broadcaster_name: z.string(),
    vacation: z
      .object({
        start_time: z.string().datetime(),
        end_time: z.string().datetime(),
      })
      .nullable(),
  }),
  pagination: paginationSchema,
});

export type ScheduleSegment = z.infer<
  typeof scheduleResponseSchema
>["data"]["segments"][0];

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
    throw new Error("Failed to create schedule segment!");
  }

  return channelScheduleResponseSchema.parseAsync(json);
}

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

  const data = await scheduleResponseSchema.parseAsync(json);
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
