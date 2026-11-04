import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@/env";

import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/router/_app";
import { captureException } from "@/server/utils/sentry";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError: ({ path, type, error }) => {
    if (env.NODE_ENV === "development") {
      console.error(`❌ tRPC failed on ${path}: ${error}`);
    }

    // Only report unexpected errors, not client errors like UNAUTHORIZED or NOT_FOUND
    if (error.code === "INTERNAL_SERVER_ERROR") {
      captureException(error, {
        tags: { "trpc.path": path },
        // `type` is reserved by Sentry within contexts
        contexts: { trpc: { path, procedureType: type } },
      });
    }
  },
});
