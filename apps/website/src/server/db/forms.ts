import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { isValidCountryCode } from "@/utils/countries";
import { prisma } from "@/server/db/client";
import { decryptRecord, encryptRecord } from "@/server/db/encryption";
import type { FormEntryWithAddress } from "@/pages/forms/[formId]";
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
  }),
);

async function decryptFormEntryWithAddress<T extends FormEntryWithAddress>(
  entry: T,
) {
  const res = await decryptRecord(entry, entryEncryptFields);
  res.mailingAddress =
    entry.mailingAddress &&
    (await decryptRecord(entry.mailingAddress, mailingAddressEncryptFields));
  return res;
}

const formEntryMailingAddressSchema = z.object({
  addressLine1: z.string().min(1),
  addressLine2: z.string(), // second address line may be empty
  postalCode: z.string().min(1),
  city: z.string().min(1),
  country: z.custom<string>(isValidCountryCode, {
    message: "Invalid country code",
  }),
  state: z.string(), // state may be left empty
});

export const formEntrySchema = z.object({
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  email: z.string().email(),
  allowMarketingEmails: z.boolean().default(false),
  mailingAddress: formEntryMailingAddressSchema.optional(),
});

export async function findActiveForm(formSlugOrId: string) {
  const now = new Date();
  return await prisma.form.findFirst({
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
  const data = await prisma.formEntry.findUnique({
    where: {
      formId_userId: {
        formId,
        userId,
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
  input: z.infer<typeof formEntrySchema>,
  { withMailingAddress = false } = {},
) {
  if (withMailingAddress && input.mailingAddress === undefined) {
    throw new Error("Mailing address is required");
  }

  return prisma.formEntry.create({
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
        entryEncryptFields,
      )),
      form: { connect: { id: formId } },
      user: { connect: { id: userId } },
      email: input.email,
      allowMarketingEmails: input.allowMarketingEmails,
      mailingAddress:
        withMailingAddress && input.mailingAddress
          ? {
              create: await encryptRecord(
                {
                  addressLine1: input.mailingAddress.addressLine1,
                  addressLine2: input.mailingAddress.addressLine2,
                  city: input.mailingAddress.city,
                  state: input.mailingAddress.state,
                  postalCode: input.mailingAddress.postalCode,
                  country: input.mailingAddress.country,
                },
                mailingAddressEncryptFields,
              ),
            }
          : undefined,
    },
  });
}

export async function getAllEntriesForForm(formId: string) {
  const entries = await prisma.formEntry.findMany({
    where: {
      formId: formId,
    },
    include: {
      mailingAddress: true,
      user: true,
    },
  });

  return Promise.all(
    entries.map((entry) => decryptFormEntryWithAddress(entry)),
  );
}

export async function createForm(input: z.infer<typeof formSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingFormWithSlug = await prisma.form.findFirst({
    where: { slug },
  });
  if (existingFormWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  return await prisma.form.create({
    data: { ...input, slug, config: JSON.stringify(input.config) },
  });
}

export async function editForm(input: z.infer<typeof existingFormSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingFormWithSlug = await prisma.form.findFirst({
    where: { slug, id: { not: input.id } },
  });
  if (existingFormWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  const { id, config, ...data } = input;
  return await prisma.form.update({
    where: { id: id },
    data: { ...data, slug, config: JSON.stringify(config) },
  });
}
