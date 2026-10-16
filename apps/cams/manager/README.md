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

`pnpm dev` runs the Worker locally, but the VPC service binding is always
remote, so you need:

- A Cloudflare login (`wrangler login` or `CLOUDFLARE_API_TOKEN`) for the
  Alveus account with Workers access and the Connectivity Directory Bind
  role, and `CLOUDFLARE_ACCOUNT_ID` set to that account.
- `.dev.vars` with `CONTROL_API_TOKEN` (see `.dev.vars.example`).

Requests made this way reach the real cameras.

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
