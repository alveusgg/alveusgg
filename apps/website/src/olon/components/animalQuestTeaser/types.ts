import type { z } from "zod";

import type { animalQuestTeaserSchema } from "./schema";

export type AnimalQuestTeaserData = z.infer<typeof animalQuestTeaserSchema>;
