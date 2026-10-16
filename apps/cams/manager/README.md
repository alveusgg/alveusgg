# Cams manager

Cloudflare Worker in front of the on-site control API
([alveusgg/control-api](https://github.com/alveusgg/control-api)). It
verifies a website-issued OAuth token with the `ptzControl` role, then
forwards the request through a Workers VPC service (the Cloudflare Tunnel on
the rack) with the control API's shared key.

- Production: `https://cams-manager.workers.alveussanctuary.org`
- Preview: `https://cams-manager.preview.workers.alveussanctuary.org`

Get a token from the website (`POST /api/oauth/token` with client
credentials and `scope=ptzControl`), then call the control API under
`/direct`, e.g. `GET /direct/info/position` with `Authorization: Bearer
<token>` and `x-camera-name: <camera>`. `@alveusgg/cams-control-client` is a
typed client for these routes.

## Local development

### Mock cameras (recommended)

Prerequisites: Node 24+, the workspace's PNPM version and installed dependencies,
plus the infrastructure checkout on **`feat/local-mocks`** (currently an unmerged
prerequisite). Start its isolated stack once:

```sh
cd /path/to/infrastructure
mocks/run.sh control-api up --build -d
```

If that stack is already running, reuse it. Do not pull or rebuild it just to
start the manager; a locally built control-api image may contain fixes that the
published image does not yet have. The stack provides REST on `127.0.0.1:1229`,
events on `127.0.0.1:3130` and mock state on `127.0.0.1:8090`.

From the monorepo root:

```sh
pnpm --filter @alveusgg/cams-manager dev:mock
```

Wait for Wrangler's `Ready on http://127.0.0.1:8787`. The command starts the
manager, two local service-binding proxies and a fake OAuth issuer on
`127.0.0.1:8798`. All listeners bind to loopback. Ports 8787 and 8798 must be
free. No Cloudflare login, account/token, `.env`, `.dev.vars` or real secret is
needed. Ctrl-C or SIGTERM stops the issuer and Wrangler and removes the temporary
configuration, login directory and Durable Object state. It leaves the Docker
mock stack running.

The runner copies the separate `wrangler.mock.json` into a temporary directory,
uses `--local`, and starts Wrangler with an allowlisted environment and isolated
HOME/XDG configuration. Existing environment files and Cloudflare credentials
are not passed to Wrangler. `CONTROL_API` and `EVENTS` are service bindings with
fixed loopback destinations; neither is a VPC service. Redirects are not followed.
The separate config contains no production environments, routes or required
secrets; its distinct worker name has `workers_dev` and preview URLs disabled.
An accidental deployment cannot replace a real worker or reach the rack: its
issuer and proxy destinations are loopback-only. Use **`dev:mock`**, rather than
invoking Wrangler on the mock config directly, to retain the environment and
credential isolation.

The fake issuer generates an ephemeral RS256 key in memory. It serves OAuth
discovery and JWKS, and `GET /mint?roles=ptzControl` issues a ten-minute access
token. Pass comma-separated roles, or `roles=` for no roles. These credentials
are only valid for this local session and never authenticate to production.
Neither the issuer nor the token helper prints tokens.

In another terminal, create an Authorization **header file** and read a position:

```sh
cd apps/cams/manager
pnpm mock:token /tmp/cams-mock.headers ptzControl
curl --fail-with-body --header @/tmp/cams-mock.headers \
  --header 'x-camera-name: garden' \
  http://127.0.0.1:8787/direct/info/position
```

The helper creates a mode-0600 file and refuses to overwrite an existing file.
Give it a new filename after expiry or after restarting the issuer. Keep the
file out of source control and delete it when finished. Do not put token values
in shell arguments, logs or screenshots.

Run the opt-in end-to-end check with the manager running:

```sh
pnpm mock:check
```

It checks the local-only health marker and mock-camera state before any writes,
then uses the generated SDK to read, load a position and zoom **the mock garden
camera**. It verifies the resulting mock state, wrong-role 403 and unknown-camera
400 responses. Through the `EVENTS` service-binding proxy it verifies a 4401
close without the mock key, an authenticated greeting, and movement start/stop
events. Ordinary `pnpm test` does not run this integration check or mutate cameras.

For SDK consumers, read the header file rather than embedding credentials:

```ts
import { readFile } from "node:fs/promises";
import { getInfoPosition } from "@alveusgg/cams-control-client";
import {
  createClient,
  createConfig,
} from "@alveusgg/cams-control-client/client";

const authorization = (await readFile("/tmp/cams-mock.headers", "utf8"))
  .trim()
  .slice("Authorization: ".length);
const client = createClient(
  createConfig({
    baseUrl: "http://127.0.0.1:8787/direct",
    headers: { Authorization: authorization },
  }),
);
const position = await getInfoPosition({
  client,
  headers: { "x-camera-name": "garden" },
  throwOnError: true,
});
```

The dev-only `ws://127.0.0.1:8787/__mock/events` probe connects with the literal
mock key. Adding `?authenticated=false` exercises the unauthenticated upstream
connection. It is plumbing for future live-state work, not a public subscription
API; neither this probe nor `/__mock/health` exists in the production entry point.

During local POST load/zoom checks, workerd has logged `ReadableStream received
over RPC disconnected prematurely` for `dangerouslyForwardFetch`, while returning
HTTP 200 with valid SDK responses and the expected mock state/events. The cause
is unconfirmed; the mock runner does not change the production forwarding path.

To stop and wipe the Docker mock stack separately:

```sh
cd /path/to/infrastructure
mocks/run.sh control-api down -v
```

### Real rack access

**Plain `pnpm dev` reaches the real cameras. Never test camera writes with it.**
Its VPC service binding is always remote, so it needs:

- A Cloudflare login (`wrangler login` or `CLOUDFLARE_API_TOKEN`) for the
  Alveus account with Workers access and the Connectivity Directory Bind
  role, and `CLOUDFLARE_ACCOUNT_ID` set to that account.
- `.dev.vars` with `CONTROL_API_TOKEN` (see `.dev.vars.example`).

`pnpm test` runs the auth middleware tests, which need neither.

## Deploying

GitHub Actions deploys `main` to production and `preview` to preview.

A new Worker can't be deployed with a missing required secret, and
`wrangler secret put` can't run before the Worker exists. If a Worker name
doesn't exist yet, create it once in the Cloudflare dashboard and add the
`CONTROL_API_TOKEN` secret before the first deploy (or deploy once with
`wrangler deploy --env <env> --secrets-file <file>`).

## Signing key rotation

The Worker caches the website's public keys for up to 10 minutes and only
refetches early when a token names a key ID (`kid`) it doesn't know. When
rotating `OAUTH_PRIVATE_KEY_PEM` on the website, also change `OAUTH_KID`;
otherwise tokens signed with the new key are rejected until the cache
expires.
