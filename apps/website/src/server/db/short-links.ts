import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma, prisma } from "@alveusgg/database";

import { SLUG_REGEX } from "@/utils/slugs";

export const shortLinkSchema = z.object({
  label: z.string().min(1),
  slug: z.string().regex(SLUG_REGEX),
  link: z.url(),
});

export type ShortLinkSchema = z.infer<typeof shortLinkSchema>;

export const existingShortLinkSchema = shortLinkSchema.and(
  z.object({
    id: z.cuid(),
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

/**
 * Count a click on a short link, creating the counter on the first click.
 *
 * This is a single native upsert: Prisma emulates `upsert` on MySQL with a
 * SELECT, UPDATE, SELECT and COMMIT, which makes concurrent clicks on the same
 * counter queue up behind each other.
 *
 * TODO: Switch back to `prisma.shortLinksTracking.upsert` once Prisma uses
 * `ON DUPLICATE KEY UPDATE` for MySQL upserts:
 * https://github.com/prisma/orm/issues/16876#issuecomment-6405736103
 */
export async function trackShortLinkClick(id: string) {
  // Field references make schema renames visible to TypeScript, but expose Prisma
  // names rather than database names. Revisit this query if @map/@@map is added.
  const fields = prisma.shortLinksTracking.fields;
  const quoteIdentifier = (name: string) =>
    Prisma.raw(`\`${name.replaceAll("`", "``")}\``);
  const table = quoteIdentifier(fields.clicks.modelName);
  const idColumn = quoteIdentifier(fields.id.name);
  const clicksColumn = quoteIdentifier(fields.clicks.name);
  const createdAtColumn = quoteIdentifier(fields.createdAt.name);
  const updatedAtColumn = quoteIdentifier(fields.updatedAt.name);

  // `updatedAt` has no database default (Prisma sets it in the client), so pass
  // the timestamps explicitly, as Prisma would.
  const now = new Date();
  await prisma.$executeRaw`
    INSERT INTO ${table} (${idColumn}, ${clicksColumn}, ${createdAtColumn}, ${updatedAtColumn})
    VALUES (${id}, 1, ${now}, ${now})
    ON DUPLICATE KEY UPDATE ${clicksColumn} = ${clicksColumn} + 1, ${updatedAtColumn} = ${now}
  `;
}
