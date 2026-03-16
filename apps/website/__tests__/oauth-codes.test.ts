import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  compareAuthorizationCode,
  issueAuthorizationCode,
} from "@/server/oauth/codes";
import { createPkceS256Challenge } from "@/server/oauth/helper";

const { mockRedis } = vi.hoisted(() => {
  class RedisValueAlreadyExistsError extends Error {
    constructor(key: string) {
      super(`Redis value already exists for key: ${key}`);
      this.name = "RedisValueAlreadyExistsError";
    }
  }

  class MockRedisCache {
    readonly store = new Map<string, string>();

    async get<T>(key: string, options: { delete: boolean }) {
      const value = this.store.get(key) ?? null;
      if (options.delete) {
        this.store.delete(key);
      }
      return value === null ? null : (JSON.parse(value) as T);
    }

    async set(
      key: string,
      value: unknown,
      options: { expiry?: number; overwrite?: boolean },
    ) {
      if (options.overwrite === false && this.store.has(key)) {
        throw new RedisValueAlreadyExistsError(key);
      }

      this.store.set(key, JSON.stringify(value));
    }
  }

  return {
    RedisValueAlreadyExistsError,
    mockRedis: new MockRedisCache(),
  };
});

vi.mock("@/env", () => {
  return {
    env: {
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      OAUTH_CLIENTS_JSON: "[]",
      OAUTH_KID: "oauth-1",
    },
  };
});

vi.mock("@/server/utils/redis", () => {
  class RedisValueAlreadyExistsError extends Error {
    constructor(key: string) {
      super(`Redis value already exists for key: ${key}`);
      this.name = "RedisValueAlreadyExistsError";
    }
  }

  return {
    RedisValueAlreadyExistsError,
    getRedis: () => mockRedis,
  };
});

const clientId = "census-production";
const redirectUri = "http://localhost:3001/callback";

function getAuthorizationCodeKey(code: string) {
  return `oauth:authorization-code:${code}`;
}

describe("oauth authorization codes", () => {
  beforeEach(() => {
    mockRedis.store.clear();
  });

  test("issues a code that verifies with the real PKCE path", async () => {
    const codeVerifier = "pkce-verifier";
    const codeChallenge = await createPkceS256Challenge(codeVerifier);

    const code = await issueAuthorizationCode({
      subject: "user-1",
      clientId,
      redirectUri,
      codeChallenge,
    });

    await expect(
      compareAuthorizationCode({
        code,
        clientId,
        redirectUri,
        codeVerifier,
      }),
    ).resolves.toMatchObject({
      sub: "user-1",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
  });

  test("rejects the wrong code verifier", async () => {
    const code = await issueAuthorizationCode({
      subject: "user-1",
      clientId,
      redirectUri,
      codeChallenge: await createPkceS256Challenge("expected-verifier"),
    });

    await expect(
      compareAuthorizationCode({
        code,
        clientId,
        redirectUri,
        codeVerifier: "wrong-verifier",
      }),
    ).rejects.toMatchObject({
      error: "invalid_grant",
      message: "PKCE verification failed.",
    });
  });

  test("consumes codes after a successful exchange", async () => {
    const codeVerifier = "pkce-verifier";
    const code = await issueAuthorizationCode({
      subject: "user-1",
      clientId,
      redirectUri,
      codeChallenge: await createPkceS256Challenge(codeVerifier),
    });

    await expect(
      compareAuthorizationCode({
        code,
        clientId,
        redirectUri,
        codeVerifier,
      }),
    ).resolves.toMatchObject({ sub: "user-1" });

    await expect(
      compareAuthorizationCode({
        code,
        clientId,
        redirectUri,
        codeVerifier,
      }),
    ).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Authorization code is invalid or expired.",
    });
  });

  test("rejects unexpected code challenge methods", async () => {
    await mockRedis.set(
      getAuthorizationCodeKey("auth-code"),
      {
        sub: "user-1",
        client_id: clientId,
        redirect_uri: redirectUri,
        code_challenge: await createPkceS256Challenge("pkce-verifier"),
        code_challenge_method: "plain",
      },
      {},
    );

    await expect(
      compareAuthorizationCode({
        code: "auth-code",
        clientId,
        redirectUri,
        codeVerifier: "pkce-verifier",
      }),
    ).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Invalid code challenge method.",
    });
  });
});
