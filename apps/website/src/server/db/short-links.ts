import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { prisma } from "@alveusgg/database";

import { SLUG_REGEX } from "@/utils/slugs";

export const shortLinkSchema = z.object({
  label: z.string().min(1),
  slug: z.string().regex(SLUG_REGEX),
  link: z.string().url(),
});

export type ShortLinkSchema = z.infer<typeof shortLinkSchema>;

export const existingShortLinkSchema = shortLinkSchema.and(
  z.object({
    id: z.string().cuid(),
  }),
);

export async function createShortLink(input: z.infer<typeof shortLinkSchema>) {
  const existingShortLinkWithSlug = await prisma.shortLinks.findFirst({
    where: { slug: input.slug },
  });
  if (existingShortLinkWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  return await prisma.shortLinks.create({
    data: input,
  });
}

export async function editShortLink(
  input: z.infer<typeof existingShortLinkSchema>,
) {
  const existingShortLinkWithSlug = await prisma.shortLinks.findFirst({
    where: { slug: input.slug, id: { not: input.id } },
  });
  if (existingShortLinkWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  const { id, ...data } = input;
  return await prisma.shortLinks.update({
    where: { id },
    data,
  });
}
