import type { z } from "zod";

import type { ambassadorsCarouselSchema } from "./schema";

export type AmbassadorsCarouselData = z.infer<typeof ambassadorsCarouselSchema>;
