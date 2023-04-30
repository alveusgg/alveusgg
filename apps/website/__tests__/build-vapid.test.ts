import { expect, test, vi } from "vitest";
import { padKeyBuffer, toPEM } from "../build-scripts/vapid";

vi.mock("@/env/server.mjs", () => {
  return {
    env: {},
  };
});

// NOTE: DO NOT USE THESE KEYS IN PRODUCTION!
const publicKey =
  "BJkXZxRFfd_x5depYVlxQ8lJ-yTUDLV6i54gKvoVu5l49JZiCaGMN-ipta2wfJyskoXYl_h3i_ac-U_qaGypH0Y";
// NOTE: DO NOT USE THESE KEYS IN PRODUCTION!
const privateKey = "GPdP9pai6q-Rh4DVKDwuaXdTKcFdLvRUh1UV5Df4RUc";

test("padKeyBuffer", () => {
  const paddedBuffer = padKeyBuffer(Buffer.from("hello"), 16);
  expect(paddedBuffer).toStrictEqual(
    Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 104, 101, 108, 108, 111])
  );
});

test("padKeyBuffer, exact size", () => {
  const input = Buffer.from("hello");
  const paddedBuffer = padKeyBuffer(input, input.byteLength);
  expect(paddedBuffer).toStrictEqual(Buffer.from([104, 101, 108, 108, 111]));
});

test("padKeyBuffer, buffer too large", () => {
  expect(() => padKeyBuffer(Buffer.from("hello"), 2)).toThrowError(
    "Key buffer is too large"
  );
});

test("toPEM", () => {
  const pem = toPEM(privateKey, publicKey);

  expect(pem).toStrictEqual(
    "-----BEGIN EC PARAMETERS-----\r\n" +
      "BggqhkjOPQMBBw==\r\n" +
      "-----END EC PARAMETERS-----\r\n" +
      "-----BEGIN EC PRIVATE KEY-----\r\n" +
      "MHcCATEEIBj3T/aWouqvkYeA1Sg8Lml3UynBXS70VIdVFeQ3+EVHoAoGCCqGSM49\r\n" +
      "AwEHoUQDQgAEmRdnFEV93/Hl16lhWXFDyUn7JNQMtXqLniAq+hW7mXj0lmIJoYw3\r\n" +
      "6Km1rbB8nKyShdiX+HeL9pz5T+pobKkfRg==\r\n" +
      "-----END EC PRIVATE KEY-----\r\n"
  );
});
