import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db/client";
import { shortLinkConfigSchema } from "@/utils/short-links";
import { convertToSlug, SLUG_REGEX } from "@/utils/slugs";

export const formSchema = z.object({
  label: z.string(),
  slug: z.string().regex(SLUG_REGEX).optional(),
  config: shortLinkConfigSchema,
});

export const existingFormSchema = formSchema.and(
  z.object({
    id: z.string().cuid(),
  }),
);

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

  return await prisma.shortLinks.create({
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
  return await prisma.shortLinks.update({
    where: { id: id },
    data: { ...data, slug, config: JSON.stringify(config) },
  });
}
