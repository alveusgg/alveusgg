import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { Client } from "@planetscale/database";

import { env } from "@/env";

let client: Client;
let db: PlanetScaleDatabase;

export function getDatabase() {
  if (!client) {
    client = new Client({
      url: env.DATABASE_URL,
    });
  }
  if (!db) {
    db = drizzle(client);
  }

  return db;
}
