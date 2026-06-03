import type { z } from "zod";

import type { merchSchema } from "./schema";

export type MerchData = z.infer<typeof merchSchema>;
