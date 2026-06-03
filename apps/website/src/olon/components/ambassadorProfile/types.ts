import type { z } from "zod";

import type { ambassadorProfileSchema } from "./schema";

export type AmbassadorProfileData = z.infer<typeof ambassadorProfileSchema>;
