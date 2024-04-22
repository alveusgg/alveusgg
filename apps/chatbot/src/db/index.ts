import type { Connection } from "@planetscale/database";
import { connect } from "@planetscale/database";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "@/env";

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
