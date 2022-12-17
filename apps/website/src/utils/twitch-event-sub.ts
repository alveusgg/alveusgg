import { z } from "zod";
import fetch from "node-fetch";
import { ExpiredAccessTokenError } from "./oauth2";

const subscriptionsResponseSchema = z.object({
  total: z.number(),
  data: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      type: z.string(),
      version: z.string(),
      condition: z.object({ broadcaster_user_id: z.string() }),
      created_at: z.string(),
      transport: z.object({
        method: z.string(),
        callback: z.string().optional(),
      }),
      cost: z.number(),
    })
  ),
  max_total_cost: z.number(),
  total_cost: z.number(),
  pagination: z.object({}),
});

export async function getSubscriptions(clientId: string, accessToken: string) {
  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  const json = await response.json();
  return await subscriptionsResponseSchema.parseAsync(json);
}

export async function removeSubscription(
  clientId: string,
  accessToken: string,
  id: string
) {
  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?${new URLSearchParams({
      id,
    })}`,
    {
      method: "DELETE",
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  // usually 204
  return response.status >= 200 && response.status < 300;
}

export async function createSubscription(
  clientId: string,
  accessToken: string,
  type: string,
  user_id: string,
  callback: string,
  secret: string
) {
  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type: type,
        version: "1",
        condition: {
          broadcaster_user_id: user_id,
        },
        transport: {
          method: "webhook",
          callback: callback,
          secret: secret,
        },
      }),
    }
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  // usually 202 Accepted
  return response.status >= 200 && response.status < 300;
}

export async function getSubscriptionsForUser(
  clientId: string,
  accessToken: string,
  userId: string
) {
  const response = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?${new URLSearchParams({
      user_id: userId,
    })}`,
    {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  const json = await response.json();
  if (response.status !== 200) {
    console.error(json);
    throw new Error("Could not get subscription!");
  }

  return await subscriptionsResponseSchema.parseAsync(json);
}
