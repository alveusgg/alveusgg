import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@alveusgg/database";

import {
  decryptFormEntryFields,
  decryptMailingAddressFields,
  encryptFormEntryFields,
  encryptMailingAddressFields,
} from "@/server/db/form-entry-encryption";

import { isValidCountryCode } from "@/utils/countries";
import { FORM_ENTRY_MAX_LENGTHS, formConfigSchema } from "@/utils/forms";
import { SLUG_REGEX, convertToSlug } from "@/utils/slugs";

import type { FormEntryWithAddress } from "@/pages/forms/[formId]";

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
    id: z.cuid(),
  }),
);

async function decryptFormEntryWithAddress<T extends FormEntryWithAddress>(
  entry: T,
) {
  const res = await decryptFormEntryFields(entry);
  res.mailingAddress =
    entry.mailingAddress &&
    (await decryptMailingAddressFields(entry.mailingAddress));
  return res;
}

const formEntryMailingAddressSchema = z.object({
  addressLine1: z.string().min(1).max(FORM_ENTRY_MAX_LENGTHS.addressLine),
  addressLine2: z.string().max(FORM_ENTRY_MAX_LENGTHS.addressLine), // second address line may be empty
  postalCode: z.string().min(1).max(FORM_ENTRY_MAX_LENGTHS.postalCode),
  city: z.string().min(1).max(FORM_ENTRY_MAX_LENGTHS.city),
  country: z.custom<string>(isValidCountryCode, {
    message: "Invalid country code",
  }),
  state: z.string().max(FORM_ENTRY_MAX_LENGTHS.state), // state may be left empty
});

export const formEntrySchema = z.object({
  givenName: z.string().min(1).max(FORM_ENTRY_MAX_LENGTHS.name),
  familyName: z.string().min(1).max(FORM_ENTRY_MAX_LENGTHS.name),
  email: z.email().max(FORM_ENTRY_MAX_LENGTHS.email),
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
      ...(await encryptFormEntryFields({
        givenName: input.givenName,
        familyName: input.familyName,
        email: input.email,
      })),
      form: { connect: { id: formId } },
      user: { connect: { id: userId } },
      allowMarketingEmails: input.allowMarketingEmails,
      mailingAddress:
        withMailingAddress && input.mailingAddress
          ? {
              create: await encryptMailingAddressFields({
                addressLine1: input.mailingAddress.addressLine1,
                addressLine2: input.mailingAddress.addressLine2,
                city: input.mailingAddress.city,
                state: input.mailingAddress.state,
                postalCode: input.mailingAddress.postalCode,
                country: input.mailingAddress.country,
              }),
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
