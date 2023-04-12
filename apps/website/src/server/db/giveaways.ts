import { z } from "zod";
import type { GiveawayEntry } from "@prisma/client";
import { getCountryName, isValidCountryCode } from "@/utils/countries";
import { prisma } from "@/server/db/client";
import { decryptRecord, encryptRecord } from "@/server/db/encryption";
import type { GiveawayEntryWithAddress } from "@/pages/giveaways/[giveawayId]";

const entryEncryptFields = ["givenName", "familyName"];

const mailingAddressEncryptFields = [
  "addressLine1",
  "addressLine2",
  "postalCode",
  "city",
  "state",
];

async function decryptGiveawayEntryWithAddress<
  T extends GiveawayEntryWithAddress
>(entry: T) {
  const res = await decryptRecord(entry, entryEncryptFields);
  res.mailingAddress = await decryptRecord(
    entry.mailingAddress,
    mailingAddressEncryptFields
  );
  return res;
}

export const giveawayEntrySchema = z.object({
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  email: z.string().email(),
  addressLine1: z.string().min(1),
  addressLine2: z.string(), // second address line may be empty
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.custom<string>(isValidCountryCode, {
    message: "Invalid country code",
  }),
  state: z.string(), // state may be left empty
});

export async function findActiveGiveaway(giveawaySlugOrId: string) {
  const now = new Date();
  return await prisma.giveaway.findFirst({
    where: {
      active: true,
      startAt: { lt: now },
      AND: [
        { OR: [{ endAt: null }, { endAt: { gt: now } }] },
        { OR: [{ id: giveawaySlugOrId }, { slug: giveawaySlugOrId }] },
      ],
    },
  });
}

export async function getGiveawayEntry(userId: string, giveawayId: string) {
  const data = await prisma.giveawayEntry.findUnique({
    where: {
      giveawayId_userId: {
        userId: userId,
        giveawayId: giveawayId,
      },
    },
    include: {
      mailingAddress: true,
    },
  });

  if (!data) {
    return data;
  }

  return await decryptGiveawayEntryWithAddress(data);
}

export async function createEntry(
  userId: string,
  giveawayId: string,
  input: z.infer<typeof giveawayEntrySchema>
) {
  return prisma.giveawayEntry.create({
    select: {
      id: true,
      createdAt: true,
      user: true,
    },
    data: {
      ...(await encryptRecord(
        {
          givenName: input.givenName,
          familyName: input.familyName,
        },
        entryEncryptFields
      )),
      giveaway: { connect: { id: giveawayId } },
      user: { connect: { id: userId } },
      email: input.email,
      mailingAddress: {
        create: await encryptRecord(
          {
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
          },
          mailingAddressEncryptFields
        ),
      },
    },
  });
}

export async function getAllEntriesForGiveaway(giveawayId: string) {
  const entries = await prisma.giveawayEntry.findMany({
    where: {
      giveawayId,
    },
    include: {
      mailingAddress: true,
      user: true,
    },
  });

  return Promise.all(
    entries.map((entry) => decryptGiveawayEntryWithAddress(entry))
  );
}
