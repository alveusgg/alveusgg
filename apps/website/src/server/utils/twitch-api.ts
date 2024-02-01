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

const clipsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      url: z.string().url(),
      embed_url: z.string().url(),
      broadcaster_id: z.string(),
      broadcaster_name: z.string(),
      creator_id: z.string(),
      creator_name: z.string(),
      video_id: z.string(),
      game_id: z.string(),
      language: z.string(),
      title: z.string(),
      view_count: z.number(),
      created_at: z.string(),
      thumbnail_url: z.string().url(),
      duration: z.number(),
      vod_offset: z.nullable(z.number()),
    }),
  ),
  pagination: paginationSchema,
});

export async function getClipDetails(slug: string | string[]) {
  const url = new URL("https://api.twitch.tv/helix/clips");

  if (Array.isArray(slug)) {
    for (const s of slug) {
      url.searchParams.append("id", s);
    }
    url.searchParams.set("first", slug.length.toString());
  } else {
    url.searchParams.set("id", slug);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(await getApplicationAuthHeaders()),
    },
  });

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Could not get clip details!");
  }

  return clipsResponseSchema.parseAsync(json);
}
