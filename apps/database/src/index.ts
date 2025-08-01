import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../prisma/generated/node/client";

import cached from "./utils/cached";
import opts from "./utils/opts";

const optsWithAdapter = {
  ...opts,
  adapter: new PrismaMariaDb(
    process.env.DATABASE_URL!.replace("mysql://", "mariadb://"),
  ),
} as const;

export const prisma = cached(
  () => new PrismaClient({ ...optsWithAdapter }),
  "prisma",
);

export type * from "../prisma/generated/node/client";
