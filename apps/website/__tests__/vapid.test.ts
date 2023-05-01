import { expect, test, vi } from "vitest";
import { getVapidAuthorizationString } from "@/server/web-push/vapid";
import { decodeBase64UrlString } from "@/utils/base64url";
import { env } from "@/env/server.mjs";

vi.mock("@/env/server.mjs", () => {
  return {
    env: {
      WEB_PUSH_VAPID_SUBJECT: "mailto:admin@alveus.gg",
      WEB_PUSH_VAPID_PRIVATE_KEY: "iE5C-sg_Qpt4CqVdnqzJUCpLTspXoZRNrW0EUn8oTu0",
      NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY:
        "BAj7ffkexjXdSBHWkyle7tyiZLy9V_pcm7vqNNlMybJ_anJobVtrtU_E2WxQDgEI7WDXLtxyHueOWyLtlRR7SQ4",
    },
  };
});

const testAudience = "https://domain.tld";

test("getVapidAuthorizationString", async () => {
  const str = await getVapidAuthorizationString(testAudience);

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
  expect(publicKey).toStrictEqual(env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY);
});
