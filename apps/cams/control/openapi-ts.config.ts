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
        // The camera is selected once per client via `createClient({ headers })`
        const index = operation.parameters?.findIndex(
          (parameter) =>
            "in" in parameter &&
            parameter.in === "header" &&
            parameter.name === "x-camera-name",
        );
        if (index !== undefined && index !== -1) {
          operation.parameters?.splice(index, 1);
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
