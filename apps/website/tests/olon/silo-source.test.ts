import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  loadSiloPage,
  readSiloSource,
  resolveSiloSource,
} from "@/olon/lib/silo-source";

describe("resolveSiloSource (source selection — pure)", () => {
  it("uses the filesystem when no git owner/repo is configured (local dev)", () => {
    const src = resolveSiloSource("src/data/pages/home.json", { cwd: "/app" });
    expect(src).toEqual({
      kind: "fs",
      path: path.join("/app", "src/data/pages/home.json"),
    });
  });

  it("falls back to the filesystem when only one of owner/repo is set", () => {
    expect(resolveSiloSource("x.json", { owner: "alveusgg", cwd: "/app" }).kind).toBe("fs");
    expect(resolveSiloSource("x.json", { repo: "alveusgg", cwd: "/app" }).kind).toBe("fs");
  });

  it("builds the PUBLIC raw GitHub URL @ ref when owner+repo are set (deploy)", () => {
    const src = resolveSiloSource("src/data/pages/home.json", {
      owner: "alveusgg",
      repo: "alveusgg",
      ref: "abc123",
    });
    expect(src).toEqual({
      kind: "git",
      url: "https://raw.githubusercontent.com/alveusgg/alveusgg/abc123/apps/website/src/data/pages/home.json",
    });
  });

  it("defaults the ref to main when none is given", () => {
    const src = resolveSiloSource("src/data/config/site.json", {
      owner: "o",
      repo: "r",
    });
    expect(src).toMatchObject({
      kind: "git",
      url: "https://raw.githubusercontent.com/o/r/main/apps/website/src/data/config/site.json",
    });
  });
});

describe("readSiloSource (IO)", () => {
  it("fetches + parses the git source with an uncached request", async () => {
    const body = { id: "home", slug: "home", sections: [{ type: "hero" }] };
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify(body), { status: 200 }),
    ) as unknown as typeof fetch;

    const out = await readSiloSource<typeof body>(
      { kind: "git", url: "https://example.test/x.json" },
      fetchImpl,
    );

    expect(out).toEqual(body);
    expect(fetchImpl).toHaveBeenCalledWith("https://example.test/x.json", {
      cache: "no-store",
    });
  });

  it("throws when the git read is not ok", async () => {
    const fetchImpl = vi.fn(
      async () => new Response("nope", { status: 404, statusText: "Not Found" }),
    ) as unknown as typeof fetch;

    await expect(
      readSiloSource({ kind: "git", url: "https://example.test/missing.json" }, fetchImpl),
    ).rejects.toThrow(/git read failed \(404/);
  });

  it("reads + parses a real silo file from the filesystem", async () => {
    const homePath = path.join(process.cwd(), "src/data/pages/home.json");
    const page = await readSiloSource<{ slug: string; sections: unknown[] }>({
      kind: "fs",
      path: homePath,
    });
    expect(page.slug).toBe("home");
    expect(Array.isArray(page.sections)).toBe(true);
  });
});

describe("loadSiloPage (default env = local FS)", () => {
  it("returns the same object as a direct read of the silo file", async () => {
    const page = await loadSiloPage("home");
    const direct = JSON.parse(
      await readFile(path.join(process.cwd(), "src/data/pages/home.json"), "utf8"),
    );
    expect(page).toEqual(direct);
    expect(page.slug).toBe("home");
    expect(page.sections.length).toBeGreaterThan(0);
  });
});
