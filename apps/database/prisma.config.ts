import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/schema.prisma",
  migrations: {
    seed: "tsx src/seed/index.ts",
  },
  datasource: {
    // Don't use Prisma's `env` method here, as it makes these required which breaks CI builds
    url: process.env.DATABASE_URL ?? "",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
