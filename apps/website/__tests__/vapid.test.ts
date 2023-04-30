import { expect, test, vi } from "vitest";
import { getVapidAuthorizationString } from "@/server/utils/web-push/vapid";
import { decodeBase64UrlString } from "@/utils/base64url";

vi.mock("@/env/server.mjs", () => {
  return {
    env: {
      WEB_PUSH_VAPID_SUBJECT: "mailto:admin@alveus.gg",
      WEB_PUSH_VAPID_PEM:
        "-----BEGIN EC PARAMETERS-----\r\n" +
        "BggqhkjOPQMBBw==\r\n" +
        "-----END EC PARAMETERS-----\r\n" +
        "-----BEGIN EC PRIVATE KEY-----\r\n" +
        "MHcCATEEIBj3T/aWouqvkYeA1Sg8Lml3UynBXS70VIdVFeQ3+EVHoAoGCCqGSM49\r\n" +
        "AwEHoUQDQgAEmRdnFEV93/Hl16lhWXFDyUn7JNQMtXqLniAq+hW7mXj0lmIJoYw3\r\n" +
        "6Km1rbB8nKyShdiX+HeL9pz5T+pobKkfRg==\r\n" +
        "-----END EC PRIVATE KEY-----\r\n",
      NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY:
        "BJkXZxRFfd_x5depYVlxQ8lJ-yTUDLV6i54gKvoVu5l49JZiCaGMN-ipta2wfJyskoXYl_h3i_ac-U_qaGypH0Y",
    },
  };
});

const testAudience = "https://domain.tld";

test("getVapidAuthorizationString", () => {
  const str = getVapidAuthorizationString(testAudience);

  const parts = str.split(", ");
  expect(parts.length).toBe(2);

  const [prefixAndJwtToken, publicKeyWithPrefix] = parts as [string, string];
  expect(prefixAndJwtToken).toMatch(/^vapid t=.*$/);
  expect(publicKeyWithPrefix).toMatch(/^k=.*$/);

  const jwtToken = prefixAndJwtToken.split("t=")[1] as string;
  expect(jwtToken).toMatch(/^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/);

  const [headerStr, payloadStr, signatureStr] = jwtToken.split(".") as [
    string,
    string,
    string
  ];

  const decodedHeader = JSON.parse(decodeBase64UrlString(headerStr));
  expect(decodedHeader).toStrictEqual({
    typ: "JWT",
    alg: "ES256",
  });

  const decodedPayload = JSON.parse(decodeBase64UrlString(payloadStr));
  expect(Object.keys(decodedPayload)).toStrictEqual(["aud", "exp", "sub"]);
  expect(decodedPayload.aud).toStrictEqual(testAudience);
  expect(decodedPayload.sub).toStrictEqual("mailto:admin@alveus.gg");
  expect(decodedPayload.exp).toBeTypeOf("number");

  expect(payloadStr).toHaveLength(102);
  expect(signatureStr).toHaveLength(86);

  const publicKey = publicKeyWithPrefix.split("k=")[1];
  expect(publicKey).toMatch(/^[a-zA-Z0-9-_]{87}$/);
});
