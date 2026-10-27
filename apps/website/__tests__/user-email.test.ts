import type { Adapter, AdapterUser } from "next-auth/adapters";
import { describe, expect, test, vi } from "vitest";

import { createFieldEncryption } from "@alveusgg/database/encryption";

import {
  decryptUserEmail,
  encryptUserEmail,
  getUserEmailBackfill,
  withEncryptedUserEmail,
} from "@/server/db/user-email";
import { fieldEncryption } from "@/server/utils/field-encryption";

vi.mock("@/env", () => ({
  env: {
    DATA_ENCRYPTION_KEYS:
      "k1:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=,k0:ZmVkY2JhOTg3NjU0MzIxMGZlZGNiYTk4NzY1NDMyMTA=",
    DATA_BLIND_INDEX_KEY: "YmxpbmQtaW5kZXgta2V5LWZvci10ZXN0cy0xMjM0NTY=",
    DATA_ENCRYPTION_PASSPHRASE: "Y6fK9EJsQQX85pmgeXjsTQdqKL5ioc37",
  },
}));

const email = "Jane.Doe@example.com";

const row = async (id = "u1", plainEmail: string | null = email) => ({
  id,
  name: "jane",
  image: null,
  emailVerified: null,
  ...(plainEmail ? await encryptUserEmail(plainEmail) : { email: null }),
});

const setup = () => {
  const adapter = {
    createUser: vi.fn(async (u) => ({ ...u, id: "u1" })),
    getUser: vi.fn(),
    getUserByAccount: vi.fn(),
    updateUser: vi.fn(async (u) => u),
    getSessionAndUser: vi.fn(),
  };
  const prisma = {
    user: { findUnique: vi.fn(), findFirst: vi.fn() },
  };
  const wrapped = withEncryptedUserEmail(
    adapter as unknown as Adapter,
    prisma as never,
  );
  return { adapter, prisma, wrapped };
};

describe("helpers", () => {
  test("encrypts the email and creates a normalized blind index", async () => {
    const result = await encryptUserEmail(email);
    expect(result.email).not.toContain("example.com");
    expect(result.emailHash).toHaveLength(43);
    expect(result.emailHash).toBe(
      await fieldEncryption.blindIndexEmail(" jane.doe@EXAMPLE.com "),
    );
    expect(await decryptUserEmail(result.email)).toBe(email);
  });

  test("decrypts plaintext emails and null", async () => {
    expect(await decryptUserEmail(email)).toBe(email);
    expect(await decryptUserEmail(null)).toBeNull();
  });
});

describe("adapter wrapper", () => {
  test("createUser stores encrypted email and hash, returns plaintext", async () => {
    const { adapter, wrapped } = setup();
    const user = await wrapped.createUser!({
      email,
      emailVerified: null,
      name: "jane",
    } as AdapterUser);
    const stored = adapter.createUser.mock.calls[0]![0];
    expect(stored.email).toMatch(/^v2\.k1\./);
    expect(stored.emailHash).toHaveLength(43);
    expect(user.email).toBe(email);
    expect(user).not.toHaveProperty("emailHash");
  });

  test("updateUser leaves the email alone if it isn't updated", async () => {
    const { adapter, wrapped } = setup();
    await wrapped.updateUser!({ id: "u1", name: "new" });
    expect(adapter.updateUser.mock.calls[0]![0]).toEqual({
      id: "u1",
      name: "new",
    });
  });

  test("updateUser encrypts a new email", async () => {
    const { adapter, wrapped } = setup();
    const user = await wrapped.updateUser!({ id: "u1", email });
    expect(adapter.updateUser.mock.calls[0]![0].email).toMatch(/^v2\.k1\./);
    expect(user.email).toBe(email);
  });

  test("getUser decrypts, and accepts plaintext rows", async () => {
    const { adapter, wrapped } = setup();
    adapter.getUser.mockResolvedValueOnce(await row());
    expect((await wrapped.getUser!("u1"))?.email).toBe(email);
    adapter.getUser.mockResolvedValueOnce({ id: "u2", email, name: "x" });
    expect((await wrapped.getUser!("u2"))?.email).toBe(email);
    adapter.getUser.mockResolvedValueOnce(null);
    expect(await wrapped.getUser!("u3")).toBeNull();
  });

  test("getUserByAccount and getSessionAndUser decrypt", async () => {
    const { adapter, wrapped } = setup();
    adapter.getUserByAccount.mockResolvedValueOnce(await row());
    expect(
      (
        await wrapped.getUserByAccount!({
          provider: "twitch",
          providerAccountId: "1",
        })
      )?.email,
    ).toBe(email);

    const session = { sessionToken: "t", userId: "u1", expires: new Date() };
    adapter.getSessionAndUser.mockResolvedValueOnce({
      session,
      user: await row(),
    });
    const result = await wrapped.getSessionAndUser!("t");
    expect(result?.user.email).toBe(email);
    expect(result?.session).toEqual(session);
  });

  test("getUserByEmail looks up by blind index", async () => {
    const { prisma, wrapped } = setup();
    prisma.user.findUnique.mockResolvedValueOnce(await row());
    const user = await wrapped.getUserByEmail!(" jane.doe@example.com");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { emailHash: await fieldEncryption.blindIndexEmail(email) },
    });
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
    expect(user?.email).toBe(email);
  });

  test("getUserByEmail falls back to plaintext rows", async () => {
    const { prisma, wrapped } = setup();
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.findFirst.mockResolvedValueOnce({ id: "u1", email });
    const user = await wrapped.getUserByEmail!(email);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email } });
    expect(user?.email).toBe(email);
  });

  test("getUserByEmail returns null if nothing matches", async () => {
    const { prisma, wrapped } = setup();
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.findFirst.mockResolvedValueOnce(null);
    expect(await wrapped.getUserByEmail!(email)).toBeNull();
  });
});

describe("getUserEmailBackfill", () => {
  test("encrypts plaintext emails", async () => {
    const data = await getUserEmailBackfill({ email, emailHash: null });
    expect(data?.email).toMatch(/^v2\.k1\./);
    expect(await decryptUserEmail(data!.email)).toBe(email);
    expect(data?.emailHash).toHaveLength(43);
  });

  test("adds the hash to encrypted emails without one", async () => {
    const { email: encrypted } = await encryptUserEmail(email);
    const data = await getUserEmailBackfill({
      email: encrypted,
      emailHash: null,
    });
    expect(data).not.toHaveProperty("email");
    expect(data?.emailHash).toBe(await fieldEncryption.blindIndexEmail(email));
  });

  test("skips migrated rows and rows without an email", async () => {
    expect(await getUserEmailBackfill((await row()) as never)).toBeNull();
    expect(
      await getUserEmailBackfill({ email: null, emailHash: null }),
    ).toBeNull();
  });
});

test("email rotation preserves an existing blind index", async () => {
  const old = createFieldEncryption({
    keys: "k0:ZmVkY2JhOTg3NjU0MzIxMGZlZGNiYTk4NzY1NDMyMTA=",
  });
  const emailHash = await fieldEncryption.blindIndexEmail(email);
  const data = await getUserEmailBackfill({
    email: await old.encrypt(email, { model: "User", field: "email" }),
    emailHash,
  });
  expect(data?.email).toMatch(/^v2\.k1\./);
  expect(data).not.toHaveProperty("emailHash");
  expect(await decryptUserEmail(data?.email)).toBe(email);
});
