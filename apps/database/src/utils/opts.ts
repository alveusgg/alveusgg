import type { Prisma } from "../../prisma/generated/node/client";

const opts = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
} as const satisfies Prisma.PrismaClientOptions;

export default opts;
