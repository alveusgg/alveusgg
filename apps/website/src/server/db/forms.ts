import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { isValidCountryCode } from "@/utils/countries";
import { prisma } from "@/server/db/client";
import { decryptRecord, encryptRecord } from "@/server/db/encryption";
import type { GiveawayEntryWithAddress } from "@/pages/forms/[formId]";
import { formConfigSchema } from "@/utils/forms";
import { convertToSlug, SLUG_REGEX } from "@/utils/slugs";

const entryEncryptFields = ["givenName", "familyName"];

const mailingAddressEncryptFields = [
  "addressLine1",
  "addressLine2",
  "postalCode",
  "city",
  "state",
  "country",
];

export type FormSchema = z.infer<typeof formSchema>;

export const formSchema = z.object({
  label: z.string(),
  slug: z.string().regex(SLUG_REGEX).optional(),
  config: formConfigSchema,
  startAt: z.date().optional(),
  endAt: z.date().optional(),
});

export const existingFormSchema = formSchema.and(
  z.object({
    id: z.string().cuid(),
  })
);

async function decryptFormEntryWithAddress<T extends GiveawayEntryWithAddress>(
  entry: T
) {
  const res = await decryptRecord(entry, entryEncryptFields);
  res.mailingAddress =
    entry.mailingAddress &&
    (await decryptRecord(entry.mailingAddress, mailingAddressEncryptFields));
  return res;
}

export const formEntrySchema = z.object({
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

export async function findActiveForm(formSlugOrId: string) {
  const now = new Date();
  return await prisma.giveaway.findFirst({
    where: {
      active: true,
      startAt: { lt: now },
      AND: [
        { OR: [{ endAt: null }, { endAt: { gt: now } }] },
        { OR: [{ id: formSlugOrId }, { slug: formSlugOrId }] },
      ],
    },
  });
}

export async function getFormEntry(userId: string, formId: string) {
  const data = await prisma.giveawayEntry.findUnique({
    where: {
      giveawayId_userId: {
        userId,
        giveawayId: formId,
      },
    },
    include: {
      mailingAddress: true,
    },
  });

  if (!data) {
    return data;
  }

  return await decryptFormEntryWithAddress(data);
}

export async function createEntry(
  userId: string,
  formId: string,
  input: z.infer<typeof formEntrySchema>
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
      giveaway: { connect: { id: formId } },
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

export async function getAllEntriesForForm(formId: string) {
  const entries = await prisma.giveawayEntry.findMany({
    where: {
      giveawayId: formId,
    },
    include: {
      mailingAddress: true,
      user: true,
    },
  });

  return Promise.all(
    entries.map((entry) => decryptFormEntryWithAddress(entry))
  );
}

export async function createForm(input: z.infer<typeof formSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingFormWithSlug = await prisma.giveaway.findFirst({
    where: { slug },
  });
  if (existingFormWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  return await prisma.giveaway.create({
    data: { ...input, slug, config: JSON.stringify(input.config) },
  });
}

export async function editForm(input: z.infer<typeof existingFormSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingFormWithSlug = await prisma.giveaway.findFirst({
    where: { slug, id: { not: input.id } },
  });
  if (existingFormWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  const { id, config, ...data } = input;
  return await prisma.giveaway.update({
    where: { id: id },
    data: { ...data, slug, config: JSON.stringify(config) },
  });
}
