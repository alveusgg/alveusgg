import { createRequire } from "node:module";

// next-superjson runs the SuperJSON SWC (Wasm) plugin in many parallel Turbopack
// loader processes. SWC compiles the plugin on first use and caches it in
// `.swc/plugins`, memory-mapping the cache file. When the cache is cold, the
// processes race to write it and crash with SIGBUS. Compiling the plugin once
// up front (before any loader runs) ensures the cache is populated.
export function warmSuperjsonPlugin() {
  try {
    const require = createRequire(
      createRequire(import.meta.url).resolve("next-superjson/package.json"),
    );
    // @swc/core is only a transitive dependency, so keep the typing minimal
    const swc = require("@swc/core") as {
      transformSync: (code: string, options: object) => unknown;
    };
    swc.transformSync("export {};", {
      filename: "warmup.ts",
      jsc: {
        parser: { syntax: "typescript" },
        experimental: {
          plugins: [[require.resolve("next-superjson-plugin"), {}]],
        },
      },
    });
  } catch (error) {
    // Not fatal: if the plugin really can't be compiled, the loader reports it
    console.warn("Could not warm the SuperJSON SWC plugin cache", error);
  }
}
