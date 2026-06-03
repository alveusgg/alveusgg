import type { z } from "zod";

import type { whatIsAlveusSchema } from "./schema";

export type WhatIsAlveusData = z.infer<typeof whatIsAlveusSchema>;
