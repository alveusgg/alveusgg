import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

import { env } from "@/env";

import { PrismaClient } from "../../../prisma/client";

const client = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

const edge = new PrismaClient({
  adapter: new PrismaPlanetScale({ url: env.DATABASE_URL }),
});

Object.defineProperty(client, "edge", {
  get() {
    return edge;
  },
});

type PrismaClientWithEdge = typeof client & {
  get edge(): typeof edge;
};

export const prisma = client as PrismaClientWithEdge;

export * from "../../../prisma/client";
