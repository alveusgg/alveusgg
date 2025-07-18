import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

import { PrismaClient } from "../prisma/generated/edge/client";
import type { PrismaClient as PrismaClientNode } from "./index";

import cached from "./utils/cached";
import opts from "./utils/opts";

const optsWithAdapter = {
  ...opts,
  adapter: new PrismaPlanetScale({ url: process.env.DATABASE_URL }),
} as const;

// Cast to the same type as the Node client for compatibility
export const prisma = cached(
  () =>
    new PrismaClient({
      ...optsWithAdapter,
    }) as PrismaClientNode<typeof optsWithAdapter>,
  "prismaEdge",
);

// Re-export all the types from the Node client for compatibility
export type * from "./index";
