# Alveus Sanctuary website

This is the community-built, open-source website for Alveus Sanctuary.
You can access the site at https://alveussanctuary.org/ (or https://alveus.gg/).

## See also

- Data repository: https://github.com/alveusgg/data
- Twitch extension: https://github.com/alveusgg/extension

## Tech stack

This project uses PNPM workspaces. The main app is the website package (`apps/website`), which is a Next.js app.

For development:

- Node.js
- PNPM with workspaces
- Prettier (code formatting)
- ESLint (code linting)

Website stack (based on [T3 Stack](https://create.t3.gg/)):

- TypeScript
- Next.js (framework)
- tRPC (typesafe api)
- Drizzle (database orm)
- Auth.js aka NextAuth.js (auth via OAuth)
- Tailwind CSS (styling)

Hosting (production):

- PlanetScale (MySQL database)
- Vercel (serverless hosting)
- DigitalOcean Spaces (S3-compatible storage)
- Upstash QStash (Simple Queue Service)

# External APIs

- Twitch OAuth (application)
- Twitch EventSub/Helix

## Systems overview

For a more complete overview see: [#9](https://github.com/alveusgg/alveusgg/issues/9)

![alveusgg-infra](https://user-images.githubusercontent.com/684458/217618231-6fb9078d-8d77-4c64-9b92-c2ebe8e58c3c.png)

## How to contribute

TODO

## How to develop / Getting started

### Prerequisites

1. Create a [Twitch application](https://dev.twitch.tv/console/apps/create), setting the OAuth callback to be `http://localhost:3000/api/auth/callback/twitch`. Note down your client ID and client secret.
2. Set up some S3-compatible storage for file uploads:
   - locally (e.g. [Minio](https://min.io/) or [Localstack](https://localstack.cloud/))
   - online (e.g. [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/), [Backblaze R2](https://www.backblaze.com/b2/cloud-storage.html) or [AWS S3](https://aws.amazon.com/s3/))
3. Optional: Obtain [Open Weathermap](https://openweathermap.org/api) keys if you want those

### Local development

1. Install Node.js and PNPM (see `engines` in `package.json` for the required versions) or use `fnm`/`nvm` to install the correct version
2. Install dependencies: `pnpm install`
3. Create a [PlanetScale](https://planetscale.com/) account (free) or provide your own MySQL server, that should give you two DSN for the main and shadow database (something like `mysql://user:pass@us-east.connect.psdb.cloud/alveusgg?sslaccept=strict`)
4. Copy `apps/website/.env.example` to `apps/website/.env`
   - Fill in the S3 section with your S3-compatible storage info
   - The vapid keys for web notifications have to be generated using `npx web-push generate-vapid-keys`
   - Next Auth secrets, Twitch EventSub API secrets and Action API secrets have to generated using `openssl rand -base64 32`
   - You may define privileged users once they have signed in via the `SUPER_USER_IDS` variable (using comma separated ids)
5. Push the database schema to the new database using `pnpm drizzle-kit push:mysql` from within `apps/website`.
6. Start the dev server: `pnpm run -r dev`
7. The website should be running at `http://localhost:3000/` (open in browser)

- Also see [T3 Stack](https://create.t3.gg/)
- Use `pnpm drizzle-kit studio` to view your database

## How to set up your own production instance

### Website

The stack should work on any Node.js server or Next.js capable hosting provider and any MySQL server,
but has only been tested on Vercel (and PlanetScale) for now.

1. Create a twitch extension (see Getting started above)
2. Set up a database (see Getting started above)
3. Go through the `apps/website/.env.example` and create your own `apps/website/.env.production` (see Getting started above)
4. Push the database schema to the new database using `pnpm drizzle-kit push:mysql`.
5. Get your own domain (optional)
6. Create a Vercel account
7. Create a new Vercel project with these settings:
   - _General_:
     - _Framework Preset_: `Next.js`, leave the other build/dev settings on the default option
     - _Root directory_: `apps/website`
     - _Node.js Version_: See `engines` in `package.json` for the required version
   - _Domains_: add your domains
   - _Git_: connect your git repo
   - _Environment Variables_: Copy and paste your `apps/website/.env.production` into the first Key field (yes you can simply copy-paste everything at once)
