import { proxy } from "./proxy.ts";

export default {
  fetch: (request: Request) => proxy(request, 3130),
} satisfies ExportedHandler;
