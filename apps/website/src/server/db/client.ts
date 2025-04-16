import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export * from "@prisma/client";
