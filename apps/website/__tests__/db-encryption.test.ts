import { expect, test } from "vitest";
import { decryptRecord, encryptRecord } from "@/server/db/encryption";

const mockRecord = {
  id: "1",
  name: "John Doe",
  email: "john.doe@domain.tld",
  createdAt: new Date(2023, 3, 12, 20, 38, 14, 310),
  flag: true,
};

const mockEncryptedRecord = {
  id: "1",
  name: "0fwQpw243HidhxIyybQqHfVEhx1ZzI7yqX+YOr5LHi7HJci7",
  email: "r4zqDjibdRkWXUf++Fxk5yN/jMHX5CGbUd39tylYslU/Ko7Ew75VFohCK5ZQEnY=",
  createdAt: mockRecord.createdAt,
  flag: true,
  salt: "IS7+eEBg1IKX6MN/5miHFA==",
};

test("encrypt record", async () => {
  const encryptedRecord = await encryptRecord({ ...mockRecord }, [
    "name",
    "email",
  ]);

  expect(encryptedRecord.id).toBe(mockRecord.id);
  expect(encryptedRecord.createdAt).toBe(mockRecord.createdAt);
  expect(encryptedRecord.flag).toBe(mockRecord.flag);
  expect(encryptedRecord.name).not.toBe(mockRecord.name);
  expect(encryptedRecord.email).not.toBe(mockRecord.email);
  expect(encryptedRecord.salt).toBeDefined();
});

test("decrypt record", async () => {
  const decryptedRecord = await decryptRecord(mockEncryptedRecord, [
    "name",
    "email",
  ]);
  expect(decryptedRecord.id).toBe(mockRecord.id);
  expect(decryptedRecord.createdAt).toBe(mockRecord.createdAt);
  expect(decryptedRecord.flag).toBe(mockRecord.flag);
  expect(decryptedRecord.name).toBe(mockRecord.name);
  expect(decryptedRecord.email).toBe(mockRecord.email);
});

test("end-to-end encrypt/decrypt record", async () => {
  const encryptedRecord = await encryptRecord({ ...mockRecord }, [
    "name",
    "email",
  ]);

  expect(encryptedRecord.id).toBe(mockRecord.id);
  expect(encryptedRecord.createdAt).toEqual(mockRecord.createdAt);
  expect(encryptedRecord.flag).toBe(mockRecord.flag);
  expect(encryptedRecord.name).not.toBe(mockRecord.name);
  expect(encryptedRecord.email).not.toBe(mockRecord.email);
  expect(encryptedRecord.salt).toBeDefined();

  const decryptedRecord = await decryptRecord(encryptedRecord, [
    "name",
    "email",
  ]);
  expect(decryptedRecord.id).toEqual(mockRecord.id);
  expect(decryptedRecord.createdAt).toBe(mockRecord.createdAt);
  expect(decryptedRecord.flag).toBe(mockRecord.flag);
  expect(decryptedRecord.name).toBe(mockRecord.name);
  expect(decryptedRecord.email).toBe(mockRecord.email);
});
