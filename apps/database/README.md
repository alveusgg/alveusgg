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

1. Create a development branch and point `DATABASE_URL` in `.env` at it, either in the dashboard or with the CLI:
   - **Dashboard:** Create the branch. Then click _Connect_, select the branch, and create a password with the _Admin_ role (needed for schema changes). Choose Prisma as the framework and copy the connection string into `DATABASE_URL`.
   - **[PlanetScale CLI](https://planetscale.com/docs/cli):** Run `pscale branch create <database> <branch>`, then `pscale connect <database> <branch>`. `pscale connect` doesn't create the branch. It proxies an existing one to a local port without needing a password, so point `DATABASE_URL` at that port while the proxy runs. It defaults to port 3306, so pass `--port` if your local MySQL already uses it.
2. Regenerate the client and push the schema to that branch: `pnpm build` then `pnpm prisma db push`.
3. Verify the change against the branch (e.g. start the website against it, or use `pnpm prisma studio`).
4. Open a deploy request from the branch into the production branch, review the schema diff, and deploy it, either in the dashboard or with the CLI:
   - **Dashboard:** Open _Branches_ and select your branch, which shows its schema diff against the base branch. Choose the production branch under _Deploy to_ and click _Create deploy request_. Then open the request under _Deploy requests_ and click _Deploy changes_ on its _Summary_ tab.
   - **PlanetScale CLI:** Run `pscale deploy-request create <database> <branch>` (add `--into <branch>` if the production branch isn't `main`). Check the diff with `pscale deploy-request diff <database> <number>`, then deploy it with `pscale deploy-request deploy <database> <number>`.
5. Once the deploy request is deployed, deploy the website so it runs code that matches the schema.
6. Delete the development branch. PlanetScale bills development branches for the time they run once the plan's included branch hours are used up, so don't leave old branches around:
   - **Dashboard:** Delete the branch on the _Branches_ page.
   - **PlanetScale CLI:** Run `pscale branch delete <database> <branch>`.
