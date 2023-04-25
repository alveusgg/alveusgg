import { expect, test } from "vitest";

import { decode, encode } from "@/utils/base64url";

const decodedStr = "This is a test value ß & \u00A9";
const decodedBuffer = new Uint8Array(Buffer.from(decodedStr));
const encodedStr = "VGhpcyBpcyBhIHRlc3QgdmFsdWUgw58gJiDCqQ";
const encodedBuffer = new Uint8Array(Buffer.from(encodedStr, "base64url"));

test("encode base64url", async () => {
  const res = encode(decodedBuffer);
  expect(res).toStrictEqual(encodedStr);
});

test("decode base64url", async () => {
  const res = decode(encodedStr);
  expect(res).toStrictEqual(encodedBuffer);
});
