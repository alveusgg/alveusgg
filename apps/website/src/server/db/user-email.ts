import type { Adapter, AdapterUser } from "next-auth/adapters";

import type { PrismaClient } from "@alveusgg/database";

import { fieldEncryption } from "@/server/utils/field-encryption";

const context = { model: "User", field: "email" } as const;

export async function encryptUserEmail(email: string) {
  return {
    email: await fieldEncryption.encrypt(email, context),
    emailHash: await fieldEncryption.blindIndexEmail(email),
  };
}

export async function decryptUserEmail(email: string | null | undefined) {
  // TODO(201-cleanup): remove allowPlaintext once the user emails are backfilled
  return fieldEncryption.decryptOptional(email, context, {
    allowPlaintext: true,
  });
}

/** Encrypt the email (and set the blind index) of user data that is about to be written */
async function encryptUserData<T extends { email?: string | null }>(data: T) {
  if (data.email === undefined) return data;
  if (data.email === null) return { ...data, emailHash: null };
  return { ...data, ...(await encryptUserEmail(data.email)) };
}

/** Decrypt the email of a user read from the database, and drop the blind index */
export async function decryptUser<
  T extends { email: string | null; emailHash?: string | null },
>(user: T): Promise<Omit<T, "emailHash">> {
  const { emailHash: _emailHash, ...rest } = user;
  return { ...rest, email: await decryptUserEmail(user.email) };
}

async function decryptOptionalUser<
  T extends { email: string | null; emailHash?: string | null },
>(user: T | null | undefined) {
  return user ? decryptUser(user) : null;
}

/**
 * Wraps a NextAuth adapter so `User.email` is encrypted at rest.
 * Emails are looked up through the blind index `User.emailHash`.
 */
export function withEncryptedUserEmail(
  adapter: Adapter,
  prisma: Pick<PrismaClient, "user">,
): Adapter {
  // The wrapped adapter returns Prisma users, so the emails are encrypted here
  const asUser = (user: unknown) => user as AdapterUser;
  return {
    ...adapter,
    createUser: async (user: Omit<AdapterUser, "id">) =>
      asUser(
        await decryptUser(
          (await adapter.createUser!(
            (await encryptUserData(user)) as AdapterUser,
          )) as AdapterUser,
        ),
      ),
    getUser: async (id) =>
      asUser(await decryptOptionalUser(await adapter.getUser!(id))),
    getUserByEmail: async (email) => {
      const emailHash = await fieldEncryption.blindIndexEmail(email);
      // TODO(201-cleanup): remove the plaintext fallback once the user emails are backfilled
      const user =
        (await prisma.user.findUnique({ where: { emailHash } })) ??
        (await prisma.user.findFirst({ where: { email } }));
      return asUser(await decryptOptionalUser(user));
    },
    getUserByAccount: async (account) =>
      asUser(
        await decryptOptionalUser(await adapter.getUserByAccount!(account)),
      ),
    updateUser: async (user: Partial<AdapterUser> & Pick<AdapterUser, "id">) =>
      asUser(
        await decryptUser(
          (await adapter.updateUser!(
            (await encryptUserData(user)) as typeof user & { id: string },
          )) as AdapterUser,
        ),
      ),
    deleteUser: adapter.deleteUser
      ? async (id) =>
          asUser(
            await decryptOptionalUser(
              (await adapter.deleteUser!(id)) as AdapterUser | null | undefined,
            ),
          )
      : undefined,
    getSessionAndUser: async (sessionToken) => {
      const result = await adapter.getSessionAndUser!(sessionToken);
      if (!result) return null;
      return { ...result, user: asUser(await decryptUser(result.user)) };
    },
  };
}

/**
 * Computes the update that migrates a stored user email to the encrypted format,
 * or null if the row is already migrated (or has no email).
 */
export async function getUserEmailBackfill(user: {
  email: string | null;
  emailHash: string | null;
}) {
  if (!user.email) return null;
  const encrypted = !fieldEncryption.needsReencryption(user.email);
  if (encrypted && user.emailHash) return null;

  // TODO(201-cleanup): plaintext emails only exist until the backfill has run
  const email = await decryptUserEmail(user.email);
  if (!email) return null;
  return {
    ...(encrypted
      ? {}
      : { email: await fieldEncryption.encrypt(email, context) }),
    ...(user.emailHash === null
      ? { emailHash: await fieldEncryption.blindIndexEmail(email) }
      : {}),
  };
}
