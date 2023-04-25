import { expect, test } from "vitest";
import { getVapidAuthorizationString } from "@/server/utils/web-push/vapid";

test("getVapidAuthorizationString", () => {
  const str = getVapidAuthorizationString("https://domain.tld");

  expect(str).toMatch(
    /^vapid t=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9\.[a-zA-Z0-9-_]{102}\.[a-zA-Z0-9-_]{86}, k=[a-zA-Z0-9-_]{87}/
  );
});
