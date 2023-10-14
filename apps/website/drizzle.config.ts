import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

// TODO: parse env?
const databaseUrl = new URL(process.env.DATABASE_URL as string);
// https://github.com/drizzle-team/drizzle-kit-mirror/issues/103
databaseUrl.searchParams.set(
  "ssl",
  JSON.stringify({ rejectUnauthorized: true }),
);

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    connectionString: databaseUrl.toString(),
  },
} satisfies Config;
