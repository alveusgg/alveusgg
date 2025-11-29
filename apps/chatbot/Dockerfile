FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

## Copy root files
WORKDIR /app
COPY ./package.json .
COPY ./pnpm-lock.yaml .
COPY ./pnpm-workspace.yaml .
COPY ./patches/ patches/

## Copy database files
WORKDIR /app/apps/database
COPY ./apps/database/tsconfig.json .
COPY ./apps/database/package.json .
COPY ./apps/database/tsup.config.ts .
COPY ./apps/database/prisma.config.ts .
COPY ./apps/database/src/ src/

## Copy chatbot files
WORKDIR /app/apps/chatbot
COPY ./apps/chatbot/tsconfig.json .
COPY ./apps/chatbot/package.json .
COPY ./apps/chatbot/.env .

## Install dependencies
RUN npm install -g corepack@latest && corepack enable && corepack install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter "{.}..." && pnpm prune --prod

## Copy code
COPY ./apps/chatbot/src/ src/

CMD ["pnpm", "start"]
