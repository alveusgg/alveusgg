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

// Use a Proxy to allow lazy initialization of the client
export const prisma = new Proxy(
  {},
  {
    get: (_, prop: string) => {
      return Reflect.get(getClient(), prop);
    },
  },
) as PrismaClient;

export * from "../prisma/client";
