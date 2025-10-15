import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../prisma/generated/client";

const client = () =>
  new PrismaClient({
    adapter: new PrismaMariaDb(
      (process.env.DATABASE_URL ?? "")
        .replace(/^mysql:\/\//, "mariadb://")
        .replace(/([?&])sslaccept=strict/, "$1ssl=true"),
    ),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Use globalThis for caching in development to avoid hot reloading issues
const cache = (process.env.NODE_ENV === "production" ? {} : globalThis) as {
  prisma?: ReturnType<typeof client>;
};

// Use a Proxy to allow lazy initialization of the client
export const prisma = new Proxy(
  {},
  {
    get: (_, prop: string) => {
      cache.prisma ??= client();
      return Reflect.get(cache.prisma, prop);
    },
  },
) as ReturnType<typeof client>;

export * from "../prisma/generated/client";
