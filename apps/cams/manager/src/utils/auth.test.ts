import { Hono } from "hono";
import { type JWK, SignJWT, exportJWK, generateKeyPair } from "jose";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const issuer = "https://issuer.test";
const discoveryUrl = `${issuer}/.well-known/oauth-authorization-server`;
const jwksUrl = `${issuer}/.well-known/jwks.json`;
const kid = "test-key";

type KeyPair = Awaited<ReturnType<typeof generateKeyPair>>;

let signingKey: KeyPair;
let otherKey: KeyPair;
let publicJwk: JWK;

const sign = (
  claims: Record<string, unknown>,
  {
    key = signingKey,
    iss = issuer,
    exp = "10m",
  }: { key?: KeyPair; iss?: string; exp?: string | number } = {},
) =>
  new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid })
    .setIssuer(iss)
    .setSubject("client-or-user-id")
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(key.privateKey);

const accessToken = (roles: string[], options?: Parameters<typeof sign>[1]) =>
  sign({ type: "access", roles }, options);

// Serves the issuer's discovery document and JWKS, with per-test overrides.
let routes: Record<string, () => Promise<Response>>;
const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  const url = input instanceof Request ? input.url : input.toString();
  const route = routes[url];
  if (!route) throw new TypeError(`Unexpected fetch: ${url}`);
  return route();
});

// The auth module caches the issuer per isolate, so load a fresh copy per test.
const createApp = async () => {
  const { requireRole } = await import("./auth");
  return new Hono<{ Bindings: Env }>().get(
    "/",
    requireRole("ptzControl"),
    (c) => c.text("ok"),
  );
};

const request = async (authorization?: string) => {
  const app = await createApp();
  return app.request(
    "/",
    { headers: authorization ? { Authorization: authorization } : {} },
    { ALVEUS_AUTH_ISSUER: issuer },
  );
};

beforeAll(async () => {
  signingKey = await generateKeyPair("RS256");
  otherKey = await generateKeyPair("RS256");
  publicJwk = { ...(await exportJWK(signingKey.publicKey)), kid, alg: "RS256" };
});

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("fetch", fetchMock);
  routes = {
    [discoveryUrl]: async () => Response.json({ issuer, jwks_uri: jwksUrl }),
    [jwksUrl]: async () => Response.json({ keys: [publicJwk] }),
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockClear();
});

describe("requireRole", () => {
  it("accepts an access token with the required role", async () => {
    const res = await request(`Bearer ${await accessToken(["ptzControl"])}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("treats the auth scheme as case-insensitive", async () => {
    const res = await request(`bearer ${await accessToken(["ptzControl"])}`);
    expect(res.status).toBe(200);
  });

  it("rejects a missing Authorization header", async () => {
    expect((await request()).status).toBe(401);
  });

  it("rejects other auth schemes", async () => {
    const res = await request(`Basic ${btoa("client:secret")}`);
    expect(res.status).toBe(401);
  });

  it("forbids a valid token without the required role", async () => {
    const res = await request(`Bearer ${await accessToken(["otherRole"])}`);
    expect(res.status).toBe(403);
  });

  it("rejects a refresh token signed by the same issuer", async () => {
    const refresh = await sign({ type: "refresh" });
    expect((await request(`Bearer ${refresh}`)).status).toBe(401);

    // Even if it somehow carried roles, it is still not an access token.
    const withRoles = await sign({ type: "refresh", roles: ["ptzControl"] });
    expect((await request(`Bearer ${withRoles}`)).status).toBe(401);
  });

  it("rejects a token signed with a different key", async () => {
    const token = await accessToken(["ptzControl"], { key: otherKey });
    expect((await request(`Bearer ${token}`)).status).toBe(401);
  });

  it("rejects a token from a different issuer", async () => {
    const token = await accessToken(["ptzControl"], {
      iss: "https://evil.test",
    });
    expect((await request(`Bearer ${token}`)).status).toBe(401);
  });

  it("rejects an expired token", async () => {
    const twoMinutesAgo = Math.floor(Date.now() / 1000) - 120;
    const token = await accessToken(["ptzControl"], { exp: twoMinutesAgo });
    expect((await request(`Bearer ${token}`)).status).toBe(401);
  });

  it("rejects a malformed token", async () => {
    expect((await request("Bearer not-a-jwt")).status).toBe(401);
  });

  describe("when the issuer is unavailable", () => {
    const failures: Record<string, () => Promise<Response>> = {
      "returns an error status": async () =>
        new Response("down", { status: 500 }),
      "returns invalid JSON": async () => new Response("<html>"),
      "is unreachable": async () => {
        throw new TypeError("fetch failed");
      },
    };

    for (const [name, failure] of Object.entries(failures)) {
      it(`responds 503 when discovery ${name}`, async () => {
        routes[discoveryUrl] = failure;
        const res = await request(
          `Bearer ${await accessToken(["ptzControl"])}`,
        );
        expect(res.status).toBe(503);
      });

      it(`responds 503 when the JWKS ${name}`, async () => {
        routes[jwksUrl] = failure;
        const res = await request(
          `Bearer ${await accessToken(["ptzControl"])}`,
        );
        expect(res.status).toBe(503);
      });
    }

    it("does not cache a failed discovery", async () => {
      const { requireRole } = await import("./auth");
      const app = new Hono<{ Bindings: Env }>().get(
        "/",
        requireRole("ptzControl"),
        (c) => c.text("ok"),
      );
      const send = async () =>
        app.request(
          "/",
          {
            headers: {
              Authorization: `Bearer ${await accessToken(["ptzControl"])}`,
            },
          },
          { ALVEUS_AUTH_ISSUER: issuer },
        );

      const healthyDiscovery = routes[discoveryUrl]!;
      routes[discoveryUrl] = async () => new Response("down", { status: 500 });
      expect((await send()).status).toBe(503);

      routes[discoveryUrl] = healthyDiscovery;
      expect((await send()).status).toBe(200);
    });
  });
});
