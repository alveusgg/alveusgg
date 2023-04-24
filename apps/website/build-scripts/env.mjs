// @ts-check
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { default as env } from "@next/env";

const basePath = resolve(fileURLToPath(import.meta.url), "../../");
env.loadEnvConfig(basePath, false);
