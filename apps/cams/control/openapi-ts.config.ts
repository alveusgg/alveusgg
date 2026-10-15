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

        // hono-openapi never marks request bodies as required, but the control
        // API rejects a missing body whenever its schema has required fields.
        const requestBody =
          "requestBody" in operation ? operation.requestBody : undefined;
        if (requestBody && "content" in requestBody) {
          const schema = requestBody.content?.["application/json"]?.schema;
          if (schema && "required" in schema && schema.required?.length) {
            requestBody.required = true;
          }
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
      validator: {
        // The client hands request validators a `Headers` instance, which the
        // generated header schemas (plain objects) reject before any request
        // is sent. Request shapes are still enforced by the generated types,
        // and the control API validates them server-side.
        request: false,
        response: true,
      },
    },
  ],
});
