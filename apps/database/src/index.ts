import { type Prisma, PrismaClient } from "../prisma/client";

const opts = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
} as const satisfies Prisma.PrismaClientOptions;

// Use globalThis for caching in development to avoid hot reloading issues
const cache = (process.env.NODE_ENV === "production" ? {} : globalThis) as {
  prisma?: PrismaClient<typeof opts>;
};

const client = () => {
  cache.prisma ??= new PrismaClient({ ...opts });
  return cache.prisma;
};

// Use a Proxy to allow lazy initialization of the client
export const prisma = new Proxy(
  {},
  {
    get: (_, prop: string) => Reflect.get(client(), prop),
  },
) as ReturnType<typeof client>;

export * from "../prisma/client";
