import type { z } from "zod";

import type { howToHelpSchema } from "./schema";

export type HowToHelpData = z.infer<typeof howToHelpSchema>;
