import { proxy } from "./proxy.ts";

export default {
  fetch: (request: Request) => proxy(request, 1229),
} satisfies ExportedHandler;
