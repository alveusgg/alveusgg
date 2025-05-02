import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

import { type Prisma, PrismaClient } from "../prisma/client";

const opts = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
} as const satisfies Prisma.PrismaClientOptions;

const createClient = () => new PrismaClient({ ...opts });
let cachedClient: ReturnType<typeof createClient>;
const getClient = () => {
  cachedClient ??= createClient();
  return cachedClient;
};

const createEdge = () =>
  new PrismaClient({
    ...opts,
    adapter: new PrismaPlanetScale({ url: process.env.DATABASE_URL }),
  });
let cachedEdge: ReturnType<typeof createEdge>;
const getEdge = () => {
  cachedEdge ??= createEdge();
  return cachedEdge;
};

// Readonly to reflect that the Proxy only exposes a getter
type PrismaClientWithEdge = Readonly<
  typeof cachedClient & {
    get edge(): typeof cachedEdge;
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

export * from "../prisma/client";
