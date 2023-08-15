import { OAuth2 } from "oauth";
import fetch from "node-fetch";
import { prisma } from "../db/client";

export class ExpiredAccessTokenError extends Error {}

type OAuth2Service = "twitch";
type OAuth2ServiceUrls = Record<
  OAuth2Service,
  {
    baseSite: string;
    authorizePath: string | undefined;
    accessTokenPath: string;
    validateTokenPath: string;
  }
>;

const oAuth2ServiceUrls: OAuth2ServiceUrls = {
  twitch: {
    baseSite: "https://id.twitch.tv/",
    authorizePath: undefined,
    accessTokenPath: "oauth2/token",
    validateTokenPath: "oauth2/validate",
  },
};

async function validateAccessToken(
  service: OAuth2Service,
  clientId: string,
  accessToken: string,
) {
  const response = await fetch(
    oAuth2ServiceUrls[service].baseSite +
      oAuth2ServiceUrls[service].validateTokenPath,
    {
      method: "GET",
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (response.status === 403) {
    throw new ExpiredAccessTokenError();
  }

  return await response.json();
}

export async function getClientCredentialsAccessToken(
  service: OAuth2Service,
  clientId: string,
  clientSecret: string,
) {
  const oauth2 = new OAuth2(
    clientId,
    clientSecret,
    oAuth2ServiceUrls[service].baseSite,
    oAuth2ServiceUrls[service].authorizePath,
    oAuth2ServiceUrls[service].accessTokenPath,
    undefined,
  );
  const cache = await prisma.clientAccessToken.findFirst({
    where: { client_id: clientId, service },
  });

  let accessToken;
  if (cache && (!cache.expiresAt || cache.expiresAt > new Date())) {
    accessToken = cache.access_token;

    try {
      await validateAccessToken(service, clientId, accessToken);
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        accessToken = undefined;
      } else {
        console.error(error);
      }
    }
  }

  if (accessToken === undefined) {
    console.info("no cached access token, trying to obtain one");

    const res = await new Promise<{
      error?: { data?: unknown; statusCode: number };
      access_token?: string;
    }>((resolve) => {
      oauth2.getOAuthAccessToken(
        "",
        { grant_type: "client_credentials" },
        (error, access_token, refresh_token, results) => {
          console.info({ results });
          resolve({ error, access_token });
        },
      );
    });

    if (res.access_token) {
      accessToken = res.access_token;
      console.info("obtained access token", { accessToken });

      await prisma.clientAccessToken.create({
        data: { service, client_id: clientId, access_token: accessToken },
      });
    }
  }

  return accessToken;
}
