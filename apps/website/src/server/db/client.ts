import { PrismaPlanetScale } from "@prisma/adapter-planetscale";

import { env } from "@/env";

import { type Prisma, PrismaClient } from "../../../prisma/client";

const opts = {
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
} as const satisfies Prisma.PrismaClientOptions;

const createClient = () => new PrismaClient({ ...opts });
let client: ReturnType<typeof createClient>;
const getClient = () => {
  client ??= createClient();
  return client;
};

const createEdge = () =>
  new PrismaClient({
    ...opts,
    adapter: new PrismaPlanetScale({ url: env.DATABASE_URL }),
  });
let edge: ReturnType<typeof createEdge>;
const getEdge = () => {
  edge ??= createEdge();
  return edge;
};

// Readonly to reflect that the Proxy only exposes a getter
type PrismaClientWithEdge = Readonly<
  typeof client & {
    get edge(): typeof edge;
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

export * from "../../../prisma/client";
