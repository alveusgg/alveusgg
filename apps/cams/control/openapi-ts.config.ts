import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json",
  output: "src/generated",
  parser: {
    patch: {
      operations: (_method, _path, operation) => {
        if (operation.operationId?.startsWith("post")) {
          operation.operationId = operation.operationId.replace(/^post/, "set");
        }
      },
    },
  },
  plugins: [
    "@hey-api/client-fetch",
    "@hey-api/typescript",
    {
      name: "zod",
      requests: {
        body: {
          types: { infer: { name: "{{name}}Params", case: "PascalCase" } },
        },
      },
    },
    {
      name: "@hey-api/sdk",
      validator: true,
    },
  ],
});
