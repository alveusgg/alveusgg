import { writeFile } from "node:fs/promises";
import { issuer } from "./issuer.mjs";

const [path, roles = "ptzControl", ...extra] = process.argv.slice(2);
try {
  if (!path || extra.length) throw new Error();
  const url = new URL("/mint", issuer);
  url.searchParams.set("roles", roles);
  const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error();
  const { accessToken } = await response.json();
  if (typeof accessToken !== "string" || !/^[\w.-]+$/.test(accessToken))
    throw new Error();
  await writeFile(path, `Authorization: Bearer ${accessToken}\n`, {
    mode: 0o600,
    flag: "wx",
  });
  console.log(
    "Wrote a local mock Authorization header file (valid for 10 minutes).",
  );
} catch {
  console.error(
    "Usage: pnpm mock:token <new-header-file> [comma-separated-roles]. Start dev:mock first; existing files are never overwritten.",
  );
  process.exitCode = 1;
}
