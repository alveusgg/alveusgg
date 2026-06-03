import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "@/env";

import timingSafeCompareString from "@/server/utils/timing-safe-compare-string";

/**
 * POST /api/revalidate — on-demand revalidation trigger for the OlonJS live-editing flow.
 *
 * Olon's MCP platform calls this AFTER it commits new content to the (public) Alveus repo,
 * to re-generate the affected path(s) so the deployed page re-reads the silo from git with
 * NO rebuild. This endpoint is READ/REVALIDATE ONLY — it never writes content (writes are
 * Olon's). It is secret-gated (`OLON_REVALIDATE_SECRET`, shared with Olon); if the secret is
 * unset the endpoint is disabled (no open/unauthenticated revalidation).
 *
 * Body: `{ "path": "/ambassadors" }` or `{ "paths": ["/", "/ambassadors/noodle"], "sha"?: "<commit>" }`.
 * `sha` is accepted for traceability; pinning the runtime read to that exact SHA is not wired
 * through `res.revalidate()` (it re-runs `getStaticProps` against `OLON_GIT_REF`) — tracked separately.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Secret required. Unset secret => endpoint disabled. Timing-safe compare (same as /api/cron).
  const { authorization } = req.headers;
  if (
    !env.OLON_REVALIDATE_SECRET ||
    authorization === undefined ||
    !timingSafeCompareString(
      authorization,
      `Bearer ${env.OLON_REVALIDATE_SECRET}`,
    )
  ) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // Accept one `path` or many `paths`. Each must be a SITE-RELATIVE path ("/...") — never a
  // full URL or protocol-relative ("//host") — so the secret can't drive arbitrary revalidation.
  const body = (req.body ?? {}) as { path?: unknown; paths?: unknown };
  const raw = body.paths ?? body.path;
  const paths = (Array.isArray(raw) ? raw : [raw]).filter(
    (p): p is string => typeof p === "string",
  );
  if (
    paths.length === 0 ||
    paths.some((p) => !p.startsWith("/") || p.startsWith("//"))
  ) {
    return res.status(400).json({
      message:
        "Body must include `path` (or `paths`) as site-relative path(s) starting with '/'.",
    });
  }

  try {
    await Promise.all(paths.map((p) => res.revalidate(p)));
    return res.status(200).json({ revalidated: true, paths });
  } catch (err) {
    return res.status(500).json({
      revalidated: false,
      message: err instanceof Error ? err.message : "revalidation failed",
    });
  }
}
