import type { z } from "zod";

import type { heroSchema } from "./schema";

export type HeroData = z.infer<typeof heroSchema>;
