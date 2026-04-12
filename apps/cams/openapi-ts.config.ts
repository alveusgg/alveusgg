import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:1229/openapi",
  output: "src/services/control",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "zod",
      requests: {
        body: {
          name: (name) =>
            `${name.replace(/^(get|post|put|patch|delete)/, "")}BodySchema`,
          case: "PascalCase",
        },
      },
    },
  ],
});
