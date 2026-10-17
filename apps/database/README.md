# Database

The database schema is a Prisma schema in [`src/schema.prisma`](src/schema.prisma), using MySQL with `relationMode = "prisma"`. Prisma generates the client into `src/generated/` (gitignored), and `pnpm build` in this package compiles `src/index.ts` into `dist/`. The website (`apps/website`) and chatbot (`apps/chatbot`) depend on this package as `@alveusgg/database`, so they consume the generated client through `dist/`.

All commands below are run with `pnpm` from `apps/database` unless noted.

## Changing the schema locally

1. Edit `src/schema.prisma`.
2. Check and format it: `pnpm lint` (runs `prisma validate` and `prisma format --check`), or `pnpm format` to apply formatting.
3. Regenerate the client and rebuild the package: `pnpm build`. This runs `prisma generate` and then `tsdown`. Running `pnpm install` also runs this via `postinstall`.
4. Push the schema to your local MySQL (started with `docker compose up -d` in `apps/website`): `pnpm prisma db push`. Your local `.env` must point `DATABASE_URL` at it (see `.env.example`).
5. Restart the TypeScript server in your editor, and restart `pnpm dev` in `apps/website` if it is running. In development the Prisma client instance is cached on `globalThis` to survive hot reloads, so a running dev server keeps using the old client until it restarts.
6. Optionally inspect the result with `pnpm prisma studio`.

Finally, run `pnpm types` and `pnpm lint` in `apps/database`, and `pnpm types` in `apps/website` and `apps/chatbot` to confirm the changes type-check downstream.

## Deploying schema changes to production (PlanetScale)

Production uses [PlanetScale](https://planetscale.com/), and schema changes reach the production database through PlanetScale deploy requests. `pnpm prisma db push` is for development databases: your local MySQL, PlanetScale development branches, or a database that doesn't use deploy requests.

1. Connect to a development branch of the database with the PlanetScale CLI proxy, e.g. `pscale connect <database> <branch>`. It listens on a local port, so point `DATABASE_URL` in `.env` at it while the proxy runs.
2. Regenerate the client and push the schema to that branch: `pnpm build` then `pnpm prisma db push`.
3. Verify the change against the branch (e.g. start the website against it, or use `pnpm prisma studio`).
4. Open a deploy request from the branch to the production branch in PlanetScale, review the schema diff, and deploy it.
5. Once the deploy request is deployed, deploy the website so it runs code that matches the schema.
