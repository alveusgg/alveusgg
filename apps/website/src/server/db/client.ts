import { PrismaClient } from "@prisma/client";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import type { Connection } from "@planetscale/database";
import { connect } from "@planetscale/database";

import { env } from "@/env/index.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

let connection: Connection;
let db: PlanetScaleDatabase;

export function getDatabase() {
  if (!connection) {
    connection = connect({
      url: env.DATABASE_URL,
    });
  }
  if (!db) {
    db = drizzle(connection);
  }

  return db;
}
