import {
  type OAuthClient,
  getOAuthClient,
  isValidOAuthClientSecret,
} from "@/server/oauth/config";

import { OAuthRequestError } from "./tokens";

export function parseBasicClientCredentials(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization || !/^Basic\s+/i.test(authorization)) {
    throw new OAuthRequestError(
      401,
      "invalid_client",
      "Missing client authentication.",
    );
  }

  const decodedCredentials = Buffer.from(
    authorization.replace(/^Basic\s+/i, ""),
    "base64",
  ).toString("utf8");
  const separatorIndex = decodedCredentials.indexOf(":");
  if (separatorIndex < 0) {
    throw new OAuthRequestError(
      401,
      "invalid_client",
      "Invalid client authentication.",
    );
  }

  return {
    clientId: decodedCredentials.slice(0, separatorIndex),
    clientSecret: decodedCredentials.slice(separatorIndex + 1),
  };
}

export function authenticateOAuthClient(request: Request): OAuthClient {
  const { clientId, clientSecret } = parseBasicClientCredentials(request);
  const client = getOAuthClient(clientId);

  if (!client || !isValidOAuthClientSecret(clientId, clientSecret)) {
    throw new OAuthRequestError(
      401,
      "invalid_client",
      "Client authentication failed.",
    );
  }

  return client;
}

export function getInvalidClientHeaders() {
  return {
    "WWW-Authenticate": 'Basic realm="oauth", error="invalid_client"',
  };
}
