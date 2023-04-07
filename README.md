# Alveus community website

This is a work-in-progress website for the Alveus Sanctuary non-profit.
The page is currently hosted at https://alveus.gg/.

## See also

- Alveus Sanctuary (official website): https://alveussanctuary.org/
- Twitch extension: https://github.com/abdullahmorrison/AlveusTwitchExtension

## Tech stack

This project uses pnpm workspaces. The main app is the website package (`apps/website`), which is a Next.js app.

For development:

- node v16
- pnpm 7 with workspaces
- prettier (code formatting)
- eslint (code linting)

Website stack (based on [T3 Stack](https://create.t3.gg/)):

- typescript
- next.js (framework)
- trpc (typesafe api)
- prisma (database orm)
- auth.js aka next-auth (auth via OAuth)
- tailwindcss (styling)

Hosting (production):

- planetscale (mysql database)
- vercel (serverless hosting)
- DigitalOcean Spaces (S3-compatible storage)

# External  APIs

- Twitch OAuth (application)
- Twitch EventSub/Helix

## Systems overview

For a more complete overview see: #9

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

1. Install Node.js v16 and pnpm
2. Install dependencies: `pnpm install`
3. Create a [Planetscale](https://planetscale.com/) account (free) or provide your own MySQL server, that should give you two DSN for the main and shadow database (something like `mysql://user:pass@us-east.connect.psdb.cloud/alveusgg?sslaccept=strict`)
4. Copy `apps/website/.env.example` to `apps/website/.env`
    - Fill the Prisma section with the database info (DSN)
    - Fill in the S3 section with your S3-compatible storage info
    - The vapid keys for web notifications have to be generated using `npx web-push generate-vapid-keys`
    - Next Auth secrets, Twitch EventSub API secrets and Action API secrets have to generated using `openssl rand -base64 32`
    - You may define privileged user once they have signed in via the `SUPER_USER_IDS` variable
5. Push the database schema to the new database using `npx prisma db push` from within `apps/website`.
6. Start the dev server: `pnpm run -r dev`
7. The website should be running at `http://localhost:3000/` (open in browser)

- Also see [T3 Stack](https://create.t3.gg/)
- Use `npx prisma studio` to view your database

## How to set up your own production instance

### Website

The stack should work on any Node.js server or Next.js capable hosting provider and any MySQL server,
but has only been tested on Vercel (and Planetscale) for now.

1. Create a twitch extension (see Getting started above)
2. Set up a database (see Getting started above)
3. Go through the `apps/website/.env.example` and create your own `apps/website/.env.production` (see Getting started above)
4. Push the database schema to the new database using `npx prisma db push`.
5. Get your own domain (optional)
6. Create a vercel account
7. Create a new vercel project with these settings:
    - *General*:
        - *Framework Preset*: `Next.js`, leave the other build/dev settings on the default option
        - *Root directory*: `apps/website`
        - *Node.js Version*: `16.x`
    - *Domains*: add your domains
    - *Git*: connect your git repo
    - *Environment Variables*: Copy paste your `apps/website/.env.production` into the first Key field (yes you can simply copy-paste everything at once)





