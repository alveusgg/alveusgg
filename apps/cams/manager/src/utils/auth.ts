import type { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { createRemoteJWKSet, errors as joseErrors, jwtVerify } from "jose";
import { z } from "zod";

const AuthProviderMetadata = z.object({
  issuer: z.string(),
  jwks_uri: z.string(),
});

const TokenPayload = z.object({
  sub: z.string(),
  roles: z.array(z.string()),
});

type AuthProvider = ReturnType<typeof createRemoteJWKSet>;

const unauthorized = (message: string) => new HTTPException(401, { message });

const fetchAuthProvider = async (
  configuredIssuer: string,
): Promise<AuthProvider> => {
  const response = await fetch(
    new URL("/.well-known/oauth-authorization-server", configuredIssuer),
  );
  if (!response.ok) {
    throw unauthorized(
      "Could not reach the authentication provider to verify your token.",
    );
  }

  const data = await response.json();
  const provider = AuthProviderMetadata.parse(data);

  return createRemoteJWKSet(new URL(provider.jwks_uri, provider.issuer), {
    cacheMaxAge: 10 * 60 * 1000,
    cooldownDuration: 30_000,
    timeoutDuration: 5_000,
  });
};

let authProvider: Promise<AuthProvider> | undefined;

const getAuthProvider = (issuer: string): Promise<AuthProvider> => {
  if (!authProvider) {
    // Don't cache a failed discovery for the lifetime of the isolate.
    authProvider = fetchAuthProvider(issuer).catch((error) => {
      authProvider = undefined;
      throw error;
    });
  }

  return authProvider;
};

const validateJWT = async (token: string, issuer: string) => {
  try {
    const jwks = await getAuthProvider(issuer);
    const { payload } = await jwtVerify(token, jwks, {
      algorithms: ["RS256"],
      issuer,
      // Absorb small clock drift between the client that minted/checked the
      // token and this server; anything larger is a real expiry and should fail.
      clockTolerance: "30s",
    });

    return payload;
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof joseErrors.JWTExpired) {
      throw unauthorized("Your token has expired.");
    }
    if (error instanceof joseErrors.JWTClaimValidationFailed) {
      throw unauthorized(
        `Your token has an invalid claim: ${error.claim} (${error.reason}).`,
      );
    }
    if (error instanceof joseErrors.JWSSignatureVerificationFailed) {
      throw unauthorized("Your token signature could not be verified.");
    }
    if (error instanceof joseErrors.JWKSNoMatchingKey) {
      throw unauthorized("Your token was signed with an unknown key.");
    }
    if (error instanceof joseErrors.JOSEError) {
      throw unauthorized(`Your token could not be verified: ${error.code}.`);
    }
    throw unauthorized("Your token could not be verified.");
  }
};

export function requireRole(
  role: string,
): MiddlewareHandler<{ Bindings: Env }> {
  return async (c: Context<{ Bindings: Env }>, next) => {
    const authorization = c.req.header("Authorization");
    if (!authorization) {
      throw unauthorized("You are not authenticated.");
    }

    const [type, token] = authorization.split(" ");
    if (type !== "Bearer" || !token) {
      throw unauthorized("You are using an invalid authentication method.");
    }

    const decoded = await validateJWT(token, c.env.ALVEUS_AUTH_ISSUER);
    const payload = TokenPayload.safeParse(decoded);
    if (!payload.success) {
      throw unauthorized(
        `Your token is malformed as it does not have the required payload: ${payload.error.message}`,
      );
    }

    if (!payload.data.roles.includes(role)) {
      throw new HTTPException(403, {
        message: "You are not authorized to perform this action.",
      });
    }

    await next();
  };
}
