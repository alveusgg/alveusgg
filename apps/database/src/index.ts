import { PrismaClient } from "../prisma/generated/node/client";

import cached from "./utils/cached";
import opts from "./utils/opts";

export const prisma = cached(() => new PrismaClient({ ...opts }), "prisma");

export type * from "../prisma/generated/node/client";
