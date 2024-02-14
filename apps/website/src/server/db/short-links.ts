import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db/client";
import { convertToSlug, SLUG_REGEX } from "@/utils/slugs";

export const shortLinkSchema = z.object({
  label: z.string(),
  slug: z.string().regex(SLUG_REGEX).optional(),
  link: z.string(),
});

export type ShortLinkSchema = z.infer<typeof shortLinkSchema>;

export const existingShortLinkSchema = shortLinkSchema.and(
  z.object({
    id: z.string().cuid(),
  }),
);

export async function createForm(input: z.infer<typeof shortLinkSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingShortLinkWithSlug = await prisma.form.findFirst({
    where: { slug },
  });
  if (existingShortLinkWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  return await prisma.shortLinks.create({
    data: { ...input, slug },
  });
}

export async function editForm(input: z.infer<typeof existingShortLinkSchema>) {
  const slug = convertToSlug(input.slug || input.label);
  const existingShortLinkWithSlug = await prisma.form.findFirst({
    where: { slug, id: { not: input.id } },
  });
  if (existingShortLinkWithSlug)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Slug already exists",
    });

  const { id, ...data } = input;
  return await prisma.shortLinks.update({
    where: { id: id },
    data: { ...data, slug },
  });
}
