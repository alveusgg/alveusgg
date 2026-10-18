import { findSourceMap } from "node:module";

import * as Sentry from "@sentry/nextjs";
import { waitUntil } from "@vercel/functions";

import { env } from "@/env";

/**
 * Next.js replaces `Error.prepareStackTrace`, so `--enable-source-maps` (in our Vercel
 * `NODE_OPTIONS`) only maps errors that get logged, not the `error.stack` that Sentry parses.
 * Map the frames with the server source maps that Node.js has already loaded instead,
 * so they don't need to be uploaded to Sentry.
 */
const sourceMapFramesIntegration = {
  name: "SourceMapFrames",
  processEvent(event: Sentry.Event) {
    for (const exception of event.exception?.values ?? []) {
      exception.stacktrace?.frames?.forEach(sourceMapFrame);
    }
    return event;
  },
};

// webpack://@alveusgg/alveusgg-website/src/server/db/forms.ts?54b5 -> src/server/db/forms.ts
function toSourcePath(source: string) {
  return new URL(source).pathname
    .replace(/^\/[^/]+\//, "")
    .replace(/^.*\/node_modules\//, "node_modules/");
}

function sourceMapFrame(frame: Sentry.StackFrame) {
  // Only map our own build output, as packages like Next.js ship their own source maps
  if (!frame.filename?.includes("/.next/server/")) return;
  if (!frame.lineno || !frame.colno) return;

  const sourceMap = findSourceMap(frame.filename);
  const origin = sourceMap?.findOrigin(frame.lineno, frame.colno);
  if (!sourceMap || !origin || !("fileName" in origin)) return;
  if (!origin.fileName.startsWith("webpack://")) return;

  const path = toSourcePath(origin.fileName);
  frame.filename = frame.abs_path = path;
  frame.lineno = origin.lineNumber;
  frame.colno = origin.columnNumber;
  frame.in_app = !path.startsWith("node_modules/");
  delete frame.module;

  if (!frame.in_app) return;
  const { sources, sourcesContent } = sourceMap.payload;
  const index = sources.findIndex(
    (source) =>
      source.startsWith("webpack://") && toSourcePath(source) === path,
  );
  const lines = sourcesContent?.[index]?.split("\n");
  if (lines) {
    const line = origin.lineNumber - 1;
    frame.pre_context = lines.slice(Math.max(0, line - 5), line);
    frame.context_line = lines[line];
    frame.post_context = lines.slice(line + 1, line + 6);
  }
}

export function getSentryConfig(): Sentry.NodeOptions {
  if (!env.SENTRY_DSN) {
    return { enabled: false };
  }

  return {
    dsn: env.SENTRY_DSN,
    integrations: [sourceMapFramesIntegration],
    environment:
      env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || env.NODE_ENV,
    release: env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: { allow: ["user-agent", "referer"] } },
      httpBodies: [],
      urlQueryParams: false,
    },
    beforeSend(event) {
      // Prisma error messages start with a newline, which leaves issue titles empty
      for (const exception of event.exception?.values ?? []) {
        exception.value = exception.value?.trim();
      }
      return event;
    },
  };
}

/**
 * Report an error that we handle ourselves (so Next.js' `onRequestError` never sees it),
 * and keep the function alive until it has been sent, like `onRequestError` does.
 */
export function captureException(
  ...args: Parameters<typeof Sentry.captureException>
) {
  Sentry.captureException(...args);
  waitUntil(Sentry.flush(2_000));
}
