import { expect, test, vi } from "vitest";

import {
  decodeBase64UrlToArrayBuffer,
  encodeArrayBufferToBase64Url,
} from "@/utils/base64url";

vi.mock("@/env/server.mjs", () => {
  return {
    env: {},
  };
});

const decodedStr = "This is a test value ß & \u00A9";
const decodedBuffer = new Uint8Array(Buffer.from(decodedStr));
const encodedStr = "VGhpcyBpcyBhIHRlc3QgdmFsdWUgw58gJiDCqQ";
const encodedBuffer = new Uint8Array(Buffer.from(encodedStr, "base64url"));

test("encode base64url", async () => {
  const res = encodeArrayBufferToBase64Url(decodedBuffer);
  expect(res).toStrictEqual(encodedStr);
});

test("decode base64url", async () => {
  const res = decodeBase64UrlToArrayBuffer(encodedStr);
  expect(res).toStrictEqual(encodedBuffer);
});
