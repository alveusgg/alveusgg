import { OAuth2 } from "oauth";
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

  if (response.status === 401) {
    throw new ExpiredAccessTokenError();
  }

  return await response.json();
}

export async function refreshAccessToken(
  service: OAuth2Service,
  clientId: string,
  clientSecret: string,
  accountId: string,
  accessToken: string,
  refreshToken: string,
  force = false,
) {
  // Skip straight to refreshing the token if force is true
  if (!force) {
    // Validate the token and only proceed if it's expired
    const err = await validateAccessToken(service, clientId, accessToken)
      .then(() => undefined)
      .catch((error) => error);
    if (!err || !(err instanceof ExpiredAccessTokenError)) {
      // Store that we verified the token
      await prisma.account.update({
        where: { id: accountId, provider: service },
        data: { verified_at: Math.floor(Date.now() / 1000) },
      });
      return;
    }
  }

  // Attempt to refresh the token
  const oauth2 = new OAuth2(
    clientId,
    clientSecret,
    oAuth2ServiceUrls[service].baseSite,
    oAuth2ServiceUrls[service].authorizePath,
    oAuth2ServiceUrls[service].accessTokenPath,
    undefined,
  );
  const res = await new Promise<{
    error?: Error | { data?: unknown; statusCode: number };
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    scope?: string;
    token_type?: string;
  }>((resolve) => {
    oauth2.getOAuthAccessToken(
      refreshToken,
      { grant_type: "refresh_token" },
      (error, access_token, refresh_token, results) => {
        const expires_at = results?.expires_in
          ? Math.floor(Date.now() / 1000) + results.expires_in
          : undefined;
        const scope = results?.scope?.join(" ");
        const token_type = results?.token_type;
        resolve({
          error,
          access_token,
          refresh_token,
          expires_at,
          scope,
          token_type,
        });
      },
    );
  });
  if (res.error) {
    throw new ExpiredAccessTokenError();
  }

  // Store the updated token in the database
  await prisma.account.update({
    where: { id: accountId, provider: service },
    data: {
      access_token: res.access_token,
      refresh_token: res.refresh_token,
      expires_at: res.expires_at,
      verified_at: Math.floor(Date.now() / 1000),
      scope: res.scope,
      token_type: res.token_type,
    },
  });
  return res.access_token;
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
  const existing = await prisma.clientAccessToken.findFirst({
    where: { client_id: clientId, service },
  });

  let accessToken;
  if (existing && (!existing.expiresAt || existing.expiresAt > new Date())) {
    accessToken = existing.access_token;

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
      error?: Error | { data?: unknown; statusCode: number };
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

      await prisma.clientAccessToken.upsert({
        where: { service_client_id: { service, client_id: clientId } },
        create: { service, client_id: clientId, access_token: accessToken },
        update: { access_token: accessToken },
      });
    }
  }

  return accessToken;
}
