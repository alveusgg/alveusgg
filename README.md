# Alveus Sanctuary website

This is the community-built, open-source website for Alveus Sanctuary.
You can access the site at [alveussanctuary.org](https://alveussanctuary.org/) (or [alveus.gg](https://alveus.gg/)).

## See also

- [Data repository](https://github.com/alveusgg/data)
- [Twitch extension](https://github.com/alveusgg/extension)

## Tech stack

This project uses PNPM workspaces. The main app is the website package (`apps/website`), which is a Next.js app.

For development:

- Node.js
- PNPM with workspaces
- Prettier (code formatting)
- ESLint (code linting)
- Docker (Compose) (local MySQL + S3 \[MinIO])

Website stack (based on [T3 Stack](https://create.t3.gg/)):

- TypeScript
- Next.js (framework)
- tRPC (typesafe API)
- Prisma (database ORM)
- Auth.js aka NextAuth.js (auth via OAuth)
- Tailwind CSS (styling)

Hosting (production):

- PlanetScale (MySQL database)
- Vercel (serverless hosting)
- DigitalOcean Spaces (S3-compatible storage)
- Upstash QStash (Simple Queue Service)

## External APIs

- Twitch OAuth (application)
- Twitch Helix

## Systems overview

For a more complete overview see: [#9](https://github.com/alveusgg/alveusgg/issues/9)

![alveusgg-infra](https://user-images.githubusercontent.com/684458/217618231-6fb9078d-8d77-4c64-9b92-c2ebe8e58c3c.png)

## How to contribute

Hey there! Welcome to Alveus.gg! There's a few ways that you can help contribute.

1. If you find a bug - you can fill out a bug [report](https://github.com/alveusgg/alveusgg/issues/new/choose)
2. If you have an idea that would make Alveus better - please fill out an idea [issue](https://github.com/alveusgg/alveusgg/issues/new/choose)
3. If you have development experience, take a look at our issues labeled [good first issue](https://github.com/alveusgg/alveusgg/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22), read our [contributing guide](https://github.com/alveusgg/alveusgg/blob/main/CONTRIBUTING.md) and agree to our [code of conduct](https://github.com/alveusgg/.github/blob/main/CODE_OF_CONDUCT.md) before you get started.

## Development setup

> [!NOTE]
> If you only want to work on the front end, you may skip the prerequisite and skip setting up a database or file storage (step 5).
> But you may encounter some errors when running the website without a database or file storage.

### Prerequisite

If you aren't working on features related to Twitch authentication, you can set the `DISABLE_ADMIN_AUTH` to `true` in your `apps/website/.env` file (see step 6 and 6.i) in order to use the admin dashboard immediately. Otherwise, create a [Twitch application](https://dev.twitch.tv/console/apps/create), setting the OAuth callback to be `http://localhost:3000/api/auth/callback/twitch`. Note down your client ID and client secret.

### Local development

1. Install Node.js using a version manager like [`nvm`](https://github.com/nvm-sh/nvm) or [`fnm`](https://github.com/Schniz/fnm). Run `nvm install`/`fnm install` in the project directory to install and `nvm use`/`fnm use` to use the correct Node.js version. Alternatively see [nodejs.org](https://nodejs.org/en/download) for other options to download and install Node.js. You can see what version we need in `package.json` under `engines`.
2. Install [pnpm](https://pnpm.io/installation) as we use this as our package manager. It will automatically respect the version defined in `package.json` under `packageManager`.
3. Authenticate with the GitHub Package Registry: `npm login --auth-type=legacy --registry=https://npm.pkg.github.com`
   1. Use your GitHub username (lowercase) as the username when prompted
   2. Create a [GitHub personal access token (classic)](https://github.com/settings/tokens/new) with the `read:packages` scope and use it as the password when prompted
4. Install dependencies: `pnpm install --frozen-lockfile`
5. Run `docker compose up -d` from within `apps/website` to start a local MySQL database, and an S3 bucket with MinIO.
6. Copy `apps/website/.env.example` to `apps/website/.env` and open your copy in a text editor and fill it:
   1. If your feature is not related to Twitch authentication, you can set `DISABLE_ADMIN_AUTH` to `true` in order to use the admin dashboard without authentication. Otherwise, fill in `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` as mentioned above.
   2. The vapid keys for web notifications have to be generated using `pnpx web-push generate-vapid-keys`
   3. The Next Auth secret (`NEXTAUTH_SECRET`), Action API secret (`ACTION_API_SECRET`) and Vercel Cron Secret (`CRON_SECRET`) have to be filled with 32-byte Base64-encoded secrets. See [Generate secrets](#generate-secrets) below.
   4. The data encryption passphrase (`DATA_ENCRYPTION_PASSPHRASE`) has to be filled with a 24-byte Base64-encoded secret. See [Generate secrets](#generate-secrets) below.
   5. You may define a Weather API key (`WEATHER_API_KEY`) to use the weather API and stream overlay. See [Weather API](#weather-api) below.
   6. If you are using Twitch authentication, you may define privileged users once they have signed in in the `SUPER_USER_IDS` variable with their CUID (using comma separated values)
7. Copy `apps/database/.env.example` to `apps/database/.env`
8. Push the database schema to the new database using `pnpm prisma db push` from within `apps/database`.
9. Start the dev server using `pnpm dev` from within `apps/website`
10. The website should be running at `http://localhost:3000/` (open in browser)

- Learn more about the stack at [Create T3 App - Introduction](https://create.t3.gg/en/introduction)
- You can use the Prisma Studio to view your database. Launch it with `pnpm prisma studio` from within `apps/database`
- You can access a direct MySQL CLI to the database with `docker compose exec db sh -c 'MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql alveusgg'`
- If you're using VSCode, add `"typescript.tsdk": "node_modules/typescript/lib"` + `"eslint.workingDirectories": [{ "pattern": "apps/*" }]` to `.vscode/settings.json` to ensure you're using the correct TypeScript version + ESLint working directories

### Generate secrets

We use Base64-encoded random strings for various secrets. To generate these secrets you can use OpenSSL or Python. OpenSSL should be preinstalled on most Unix-like systems (Linux, macOS, WSL). If neither is installed on your system, you may need to install it yourself.

- Using OpenSSL:
  - Generate a 32-byte secret: `openssl rand -base64 32`
  - Generate a 24-byte secret: `openssl rand -base64 24`
- Using Python:
  _You may need to call `python3` instead depending on your installation._
  - Generate a 32-byte secret: `python -c "import os, base64; print(base64.b64encode(os.urandom(32)).decode('utf-8'))"`
  - Generate a 24-byte secret: `python -c "import os, base64; print(base64.b64encode(os.urandom(24)).decode('utf-8'))"`

### Weather API

Alveus operates a weather station on-site that uploads data to wunderground.com. Wunderground provide an API via api.weather.com that we use to display the weather for the stream overlay (and in the API for the Twitch chat bot). Accessing the API required an API key, which is only granted to users that have a weather station on wunderground.com.

It _seems_ that anyone can sign up for a Wunderground account and register a weather station on the site, at which point you'll be granted access to the API, without ever needing to actually connect a weather station and upload data. It _seems_ you can use this to get an API key to develop with the weather API locally.

_In production, we use the actual API key for the account that is associated with the Alveus weather station, which does upload data to the site._

### Cloudflare Stream

We use Cloudflare Stream to host a low-latency variation of the live cams specifically for camera operators. To do that, we need to do some setup with Cloudflare.

1. Login to the Cloudflare dashboard and navigate to Stream -> Live Inputs and click "Create Live Input"
2. Tick the "Require Signed URLs" box and leave the rest of the defaults
3. Click "Create Live Input" button
4. Make a note of the "Live Input ID", this will be used to configure the `CF_STREAM_LOLA_VIDEO_ID` environment variable.
5. Make a note of the host, this will be used to configure the `CF_STREAM_HOST` environment variable. It will look like `customer-<unique-customer-id>.cloudflarestream.com` and can be found under Connection Info -> WebRTC (WHIP) -> WebRTC (WHIP) URL.
6. [Create an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with the `Stream:Edit` permission. This is sometimes referred to as "Stream" under the "Account" dropdown.
7. Use that token to make a [request to create a set of signing keys for Cloudflare Stream](https://developers.cloudflare.com/api/resources/stream/subresources/keys/methods/create/). This is global to the account, not just this specific stream.
8. Make a note of the `id` and `jwk` values, these will be used to configure the `CF_STREAM_KEY_ID` and `CF_STREAM_KEY_JWK` environment variables.

9. Ensure that the following environment variables are set in `apps/website/.env`:
   - `CF_STREAM_KEY_ID`
   - `CF_STREAM_KEY_JWK`
   - `CF_STREAM_LOLA_VIDEO_ID`
   - `CF_STREAM_HOST`

## Production deployment

### Website

The stack should work on any Node.js server or Next.js capable hosting provider and any MySQL server,
but has only been tested on Vercel (and PlanetScale) for now.

1. Create a twitch application (see [Development setup](#development-setup) above)
2. Create a [PlanetScale](https://planetscale.com/) account or provide your own MySQL server, that should give you two DSN for the main and shadow database (something like `mysql://user:pass@us-east.connect.psdb.cloud/alveusgg?sslaccept=strict` and `mysql://user:pass@us-east.connect.psdb.cloud/alveusgg/shadow?sslaccept=strict`)
3. Set up some S3-compatible storage for file uploads (e.g. [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Backblaze R2](https://www.backblaze.com/b2/cloud-storage.html) or [AWS S3](https://aws.amazon.com/s3/))
4. Go through the `apps/website/.env.example` and create your own `apps/website/.env.production` (see [Development setup](#development-setup) above) and also:
   1. Fill the Prisma section with the database info (DSN)
   2. Fill in the S3 section with your S3-compatible storage info
5. Push the database schema to the new database using `pnpm prisma db push`.
6. Get your own domain (optional)
7. Create a Vercel account
8. Create a new Vercel project with these settings:
   - _General_:
     - _Framework Preset_: `Next.js`, leave the other build/dev settings on the default option
     - _Root directory_: `apps/website`
     - _Node.js Version_: See `engines` in `package.json` for the required version
   - _Domains_: add your domains
   - _Git_: connect your Git repo
   - _Environment Variables_: Copy your `apps/website/.env.production` here
