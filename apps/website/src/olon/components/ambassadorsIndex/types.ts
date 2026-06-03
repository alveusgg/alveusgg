import type { z } from "zod";

import type { ambassadorsIndexSchema } from "./schema";

export type AmbassadorsIndexData = z.infer<typeof ambassadorsIndexSchema>;
