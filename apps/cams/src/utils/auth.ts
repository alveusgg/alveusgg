import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";

const AlveusAuthProviderMetadata = z.object({
  issuer: z.string(),
  jwks_uri: z.string(),
});

type AuthProvider = ReturnType<typeof createRemoteJWKSet>;

const fetchAuthProvider = async (
  configuredIssuer: string,
): Promise<AuthProvider> => {
  const response = await fetch(
    new URL("/.well-known/oauth-authorization-server", configuredIssuer),
  );
  if (!response.ok) {
    throw new Error("Failed to fetch auth provider");
  }

  const data = await response.json();
  const provider = AlveusAuthProviderMetadata.parse(data);

  return createRemoteJWKSet(new URL(provider.jwks_uri, provider.issuer), {
    cacheMaxAge: 10 * 60 * 1000,
    cooldownDuration: 30_000,
    timeoutDuration: 5_000,
  });
};

let authProvider: AuthProvider | undefined;

const getAuthProvider = async (): Promise<AuthProvider> => {
  if (!authProvider) {
    authProvider = await fetchAuthProvider(process.env.ALVEUS_AUTH_ISSUER);
  }

  return authProvider;
};

export const validateJWT = async (token: string) => {
  try {
    const jwks = await getAuthProvider();
    const { payload } = await jwtVerify(token, jwks, {
      algorithms: ["RS256"],
      issuer: process.env.ALVEUS_AUTH_ISSUER,
    });

    return {
      subject: payload.sub,
      payload,
    };
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to validate token");
  }
};
