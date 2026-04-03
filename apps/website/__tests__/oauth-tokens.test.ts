import { createSign } from "node:crypto";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyOAuthTokenClaims,
  verifyRefreshToken,
} from "@/server/oauth/tokens";

const {
  mockGetRolesForUser,
  mockGetTwitchUserId,
  mockPrismaUserFindUnique,
  privateKeyPem,
} = vi.hoisted(() => {
  return {
    mockGetRolesForUser: vi.fn(),
    mockGetTwitchUserId: vi.fn(),
    mockPrismaUserFindUnique: vi.fn(),
    privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDiFYKy4FYrkLb6
oAxjahM8+RNH+C+dvciDYYe2ZKOUn42d2qI3fnSzyIJ5ix1hEPEOe+eG2gnOgVjC
JlCKC87cKW0YDsiu9EgYgcx4whvLCLE95pGbcskNzbocst4Awq1+QX3P7mNcSn83
jEbivPandekzIEIKQvJ2+10mGarqcBBRYPbOsctiBLuVTc65UJYkJqH2FSWNqFvg
1Wlb1ipRGbDf38IM+PbJW2NExZ/oMqAcVcB/SZ1mP1d2CWz+c8SD0fEva41KniY/
QCF+Hvwiq4/GQol2thPLQRmQeRKHuGbK+iV6HKNZjoO/iZ56Wa2xcb4EY6SvdgjP
BUeXHx0vAgMBAAECggEAMQWuBeBb/u1Np9F9bi8Jhd6SPjhEBuWobUiAF14CFE92
cyR9qR/L6VHQbM9r6ui0BEp8nQJ5PuRQHSUWsKA31ghLhfxqqnkAiwPWFNcuFJvJ
Zt0wdG7yxoH12ZQ1TB/qY6aKw8PymofyxtYtZqvHpe8Mxk+30ibLEV6Wx5SoOVXz
1+p4BTscYRaO1ySpNpKIfPX1Y5ejdQVNJP4nuLbwVzohYrCZHcsm0mQZ+nAhxMtP
Oi3d6jQlkeZ2uCqpKnC9AEl67lPFuVcogqJxnt4XQhxcD/wj5OpmgWW0/UjfhM3z
uylrNZqp5VaymRK9HZfyjAeZ7PvwF5uyK+6Y39K02QKBgQD8emOGYeVNEcaasRI+
ZHxK0e9sj0syIy6mzqJeEBKC9Yia4GocyILJdjCzlx41ofSqPHTdckp9QkzVJvN9
UHQCBQ18DaAhEerwLfkZpPtuIVCICydo3nL09XypuEtJTNTe/flxu0yXQHjcB1dE
oZAZzR5w2O8OaTLy09jYH4t26QKBgQDlPN4KWWmXBGkKiA9G4XCSareBCTOEV65o
IiVpetx328m2rPFdtJTKjHbflo6T8/wdpHtYMzbHCcMZzW0M0R7okbE9pAeAV4/F
CXyjZEy+Tvhui185wrDb/E5n2JPhNq7PM1n1ghZASXY3RBW9b5j66QP967+U2ben
p+nBx0OUVwKBgFTTvgqRa5woQ8UHhyylUElHHZ0oy8ftoCf1NwJJfh635gy7J4vC
JocPia9dL44veueTZmRcmQBavTvEWXyaAlAHaI9seIeD4J6Po6jlEIDg+pCqxrPq
QU9iB19yhwD6qm69gAihOEt9It4yLTTm32Z7zyV1DWSXHcIOQUXj21S5AoGBAOS7
BxJshN8al3TareObridqNA+cjrrOgkeFSq8k2DcAJxUPGwbU2GICJdqS71DRcg5h
wHERKOcQ5osoXlcbkiucs609rf5xYBLKlIKz4Z9CTMCAcFPB35ag+drET0m4tlQo
eOpvEqSyqDIczVRntc0mE8WZJV/wnT+8W5HusY+hAoGAehqPZLVTxNwwuVCq+b4P
Uc+ybGTg2hg8P2r7bCfeScNIjh2jpGomtVG9PIm1buJXpZjBHEGFt1z84bMOs7+2
tRQTz+VpG/uRF3xRWBQIxstzYpzCz6K2RLPOgoHdup7lDkNP7J9X6jZpGUTWyZQ2
GBPLc2l3Ahs4fttrtK0B2xM=
-----END PRIVATE KEY-----`,
  };
});

vi.mock("@/env", () => {
  return {
    env: {
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      OAUTH_CLIENTS_JSON: "[]",
      OAUTH_KID: "oauth-1",
      OAUTH_PRIVATE_KEY_PEM: privateKeyPem,
    },
  };
});

vi.mock("@alveusgg/database", () => {
  return {
    prisma: {
      user: {
        findUnique: mockPrismaUserFindUnique,
      },
    },
  };
});

vi.mock("@/server/db/users", () => {
  return {
    getRolesForUser: mockGetRolesForUser,
    getTwitchUserId: mockGetTwitchUserId,
  };
});

function encodeBase64Url(value: object) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function signJwt(header: object, claims: object) {
  const encodedHeader = encodeBase64Url(header);
  const encodedClaims = encodeBase64Url(claims);
  const unsignedToken = `${encodedHeader}.${encodedClaims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKeyPem);

  return `${unsignedToken}.${Buffer.from(signature).toString("base64url")}`;
}

describe("oauth tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("issues and verifies a real access token", async () => {
    const token = await issueAccessToken({
      subject: "user-1",
      clientId: "census-production",
      roles: ["admin"],
    });

    await expect(verifyAccessToken(token)).resolves.toMatchObject({
      iss: "http://localhost:3000",
      sub: "user-1",
      client_id: "census-production",
      type: "access",
      roles: ["admin"],
    });
  });

  test("rejects a token whose payload was tampered with", async () => {
    const token = await issueAccessToken({
      subject: "user-1",
      clientId: "census-production",
      roles: ["admin"],
    });
    const [encodedHeader, _, encodedSignature] = token.split(".");
    const tamperedClaims = Buffer.from(
      JSON.stringify({
        iss: "http://localhost:3000",
        sub: "user-2",
        client_id: "census-production",
        type: "access",
        roles: ["admin"],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600,
        jti: "tampered-token",
      }),
      "utf8",
    ).toString("base64url");

    await expect(
      verifyAccessToken(
        `${encodedHeader}.${tamperedClaims}.${encodedSignature}`,
      ),
    ).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Token signature is invalid.",
    });
  });

  test("rejects expired tokens", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

    const token = await issueAccessToken({
      subject: "user-1",
      clientId: "census-production",
      roles: ["admin"],
    });

    vi.setSystemTime(new Date("2025-01-01T00:11:00.000Z"));

    await expect(verifyAccessToken(token)).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Token has expired.",
    });
  });

  test("rejects refresh tokens where access tokens are expected", async () => {
    const token = await issueRefreshToken({
      subject: "user-1",
      clientId: "census-production",
    });

    await expect(verifyAccessToken(token)).rejects.toMatchObject({
      error: "invalid_token",
      message: "Expected an access token.",
    });
  });

  test("rejects access tokens where refresh tokens are expected", async () => {
    const token = await issueAccessToken({
      subject: "user-1",
      clientId: "census-production",
      roles: ["admin"],
    });

    await expect(verifyRefreshToken(token)).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Expected a refresh token.",
    });
  });

  test("rejects a token with the wrong issuer even when it is properly signed", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signJwt(
      {
        alg: "RS256",
        kid: "oauth-1",
        typ: "JWT",
      },
      {
        iss: "http://attacker.example",
        sub: "user-1",
        client_id: "census-production",
        iat: now,
        exp: now + 600,
        jti: "wrong-issuer",
        type: "access",
        roles: ["admin"],
      },
    );

    await expect(
      verifyOAuthTokenClaims<Record<string, unknown>>(token),
    ).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Token issuer is invalid.",
    });
  });

  test("rejects a token with the wrong key id in the header", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signJwt(
      {
        alg: "RS256",
        kid: "oauth-2",
        typ: "JWT",
      },
      {
        iss: "http://localhost:3000",
        sub: "user-1",
        client_id: "census-production",
        iat: now,
        exp: now + 600,
        jti: "wrong-kid",
        type: "access",
        roles: ["admin"],
      },
    );

    await expect(
      verifyOAuthTokenClaims<Record<string, unknown>>(token),
    ).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Token header is invalid.",
    });
  });

  test("rejects a token with extra dot-separated segments", async () => {
    const token = await issueAccessToken({
      subject: "user-1",
      clientId: "census-production",
      roles: ["admin"],
    });

    await expect(
      verifyOAuthTokenClaims<Record<string, unknown>>(`${token}.extra`),
    ).rejects.toMatchObject({
      error: "invalid_grant",
      message: "Token is malformed.",
    });
  });
});
