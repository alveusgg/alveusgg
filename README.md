# Alveus community website

This is a work-in-progress community page around the Alveus Sanctuary twitch stream and related content. The page is
currently hosted at https://www.alveus.gg/.

Main ideas:
- Content focused hub for viewers (new and old) independent of the platforms (twitch/youtube/instagram), while the official 
    website can be the official presentation of the Sanctuary not only towards viewer but also industry and other 
    interested parties.
- Possible Features:
  - Notifications for on-stream and off-stream content (stream segment changes, video releases, ig posts). #1
  - Let viewers explore alveus online with content about the ambassadors and facilities, structuring and linking existing content.
  - Schedule of planned content and events.
- Could be a platform for user-interactions with the Sanctuary like feeding ambassadors for donations etc.
- Could be a backend for other applications like the twitch extension.


## See also

- Alveus Sanctuary (official website): https://alveussanctuary.org/
- Twitch extension: https://github.com/abdullahmorrison/AlveusTwitchExtension

## Tech stack

This project uses pnpm workspaces. The main app is the website package, see https://github.com/alveusgg/alveusgg/blob/main/apps/website/README.md

## Systems overview

For a more complete overview see: #9

![alveusgg-infra](https://user-images.githubusercontent.com/684458/217618231-6fb9078d-8d77-4c64-9b92-c2ebe8e58c3c.png)

## How to contribute

TODO

## How to develop / Getting started

TODO

### Prerequisites 

1. Create a [twitch extension](https://dev.twitch.tv/console/extensions/create), note down your Client ID and Client Secret
    - TODO: Set up OAuth callback
2. Optional: Obtain [Open Weathermap](https://openweathermap.org/api) and [Cookiebot keys](https://www.cookiebot.com/) if you want those


### Local development

0. Install Node.js v16 and pnpm
1. Install dependencies: `pnpm install`
2. Create a [Planetscale](https://planetscale.com/) account (free) or provide your own MySQL server, that should give you two DSN for the main and shadow database (something like `mysql://user:pass@us-east.connect.psdb.cloud/alveusgg?sslaccept=strict`)
3. Copy `apps/website/.env.example` to `apps/website/.env`
    - Fill the Prisma section with the database info (DSN)
    - The vapid keys for web notifications have to be generated using `npx web-push generate-vapid-keys`
    - Next Auth secrets, Twitch EventSub API secrets and Action API secrets have to generated using `openssl rand -base64 32`
    - You may define priveleged user once they have signed in in the `SUPER_USER_IDS` variable
4. Push the database schema to the new database using `npx prisma db push`.
4. Start the dev server: `pnpm run -r dev`
5. The website should be running at `http://localhost:3000/` (open in browser)

- Also see [T3 Stack](https://create.t3.gg/)
- Use `npx prisma studio` to view your database

## How to set up your own production instance

### Website

The stack should work on any Node.js server or Next.js capable hoster and any MySQL server, but is only tested on Vercel (and Planetscale) for now.

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

### Server

TODO




