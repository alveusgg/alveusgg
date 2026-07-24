import { z } from "zod";

import { publicProcedure, router } from "@/server/trpc/trpc";

export const shortLinksRouter = router({
  getShortLink: publicProcedure
    .input(z.string())
    .query(({ ctx, input: slug }) =>
      ctx.prisma.shortLinks.findUnique({
        where: { slug },
        select: { id: true, slug: true, link: true },
      }),
    ),
});
