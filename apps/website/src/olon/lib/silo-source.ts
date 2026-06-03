import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PageConfig } from "@olonjs/core/runtime";

import { env } from "@/env";

/**
 * Runtime silo read for the OlonJS (flag-on) path.
 *
 * The silo (page content JSON) is the source of truth at runtime. Instead of a top-level
 * `import` (baked at build → needs a rebuild to change), the flag-on pages read the silo
 * here, at request time, so an edit to a JSON is reflected with no rebuild:
 *
 *   - LOCAL (`next dev`, OLON_GIT_REPO unset): read from the filesystem. `next dev`
 *     re-runs `getStaticProps` per request, so editing a JSON shows on refresh.
 *   - DEPLOY (OLON_GIT_REPO set): fetch from the PUBLIC Alveus repo via GitHub raw at
 *     `OLON_GIT_REF` (or an explicit `ref` arg). The repo is public (open-source) → NO
 *     token. Pass a commit SHA as the ref to read an immutable commit (avoids CDN-stale raw).
 *
 * Writes/editing are Olon's (jsonpages-platform), never here — this module only reads.
 * The source is chosen by env (presence of OLON_GIT_OWNER + OLON_GIT_REPO), NOT a flag;
 * the on/off switch is the existing NEXT_PUBLIC_OLON_PILOT, gated at the page level.
 */

// Silo pages dir, cwd-relative (`next` runs with cwd = apps/website, where this resolves
// directly); the git URL additionally needs the monorepo subpath where the app lives.
const PAGES_DIR = "src/data/pages";
const REPO_SUBPATH = "apps/website";

export type SiloSource =
  | { kind: "fs"; path: string }
  | { kind: "git"; url: string };

/**
 * Decide WHERE a silo file is read from — pure, so it is unit-testable without IO or env
 * mocking. Git when both owner+repo are set (deploy); filesystem otherwise (local dev).
 */
export function resolveSiloSource(
  relPath: string,
  opts: { owner?: string; repo?: string; ref?: string; cwd?: string },
): SiloSource {
  if (opts.owner && opts.repo) {
    const ref = opts.ref || "main";
    return {
      kind: "git",
      url: `https://raw.githubusercontent.com/${opts.owner}/${opts.repo}/${ref}/${REPO_SUBPATH}/${relPath}`,
    };
  }
  return { kind: "fs", path: path.join(opts.cwd ?? process.cwd(), relPath) };
}

/**
 * Read + JSON-parse a resolved silo source. `fetchImpl` is injectable for tests; the git
 * read is uncached so a fresh ref/SHA always returns fresh content (no rebuild needed).
 */
export async function readSiloSource<T>(
  src: SiloSource,
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  if (src.kind === "git") {
    const res = await fetchImpl(src.url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(
        `[olon/silo] git read failed (${res.status} ${res.statusText}) for ${src.url}`,
      );
    }
    return (await res.json()) as T;
  }
  return JSON.parse(await readFile(src.path, "utf8")) as T;
}

/** Load a page's silo JSON (e.g. "home", "ambassadors", "ambassadors/noodle"). */
export function loadSiloPage(slug: string, ref?: string): Promise<PageConfig> {
  const src = resolveSiloSource(`${PAGES_DIR}/${slug}.json`, {
    owner: env.OLON_GIT_OWNER,
    repo: env.OLON_GIT_REPO,
    ref: ref || env.OLON_GIT_REF,
  });
  return readSiloSource<PageConfig>(src);
}
