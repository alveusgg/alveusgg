import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

import { type Prisma, PrismaClient } from "../prisma/generated/client";

const opts = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
} as const satisfies Prisma.PrismaClientOptions;

const createClient = () => new PrismaClient({ ...opts });
const createEdge = () =>
  new PrismaClient({
    ...opts,
    adapter: new PrismaPlanetScale({ url: process.env.DATABASE_URL }),
  });

// Use globalThis for caching in development to avoid hot reloading issues
const cache = (process.env.NODE_ENV === "production" ? {} : globalThis) as {
  client: ReturnType<typeof createClient>;
  edge: ReturnType<typeof createEdge>;
};

const getClient = () => {
  cache.client ??= createClient();
  return cache.client;
};

const getEdge = () => {
  cache.edge ??= createEdge();
  return cache.edge;
};

// Readonly to reflect that the Proxy only exposes a getter
type PrismaClientWithEdge = Readonly<
  typeof cache.client & {
    get edge(): typeof cache.edge;
  }
>;

// Use a Proxy to allow lazy initialization of both clients
export const prisma = new Proxy(
  {},
  {
    get: (_, prop: string) => {
      if (prop === "edge") {
        return getEdge();
      }
      return Reflect.get(getClient(), prop);
    },
  },
) as PrismaClientWithEdge;

export * from "../prisma/generated/client";
