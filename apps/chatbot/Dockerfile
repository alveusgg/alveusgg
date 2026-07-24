FROM node:24-alpine
ENV PNPM_HOME="/pnpm"
ENV CI="true"
ENV PATH="$PNPM_HOME:$PATH"

## Copy root files
WORKDIR /app
COPY ./.npmrc .
COPY ./package.json .
COPY ./pnpm-lock.yaml .
COPY ./pnpm-workspace.yaml .

## Copy database files
WORKDIR /app/apps/database
COPY ./apps/database/tsconfig.json .
COPY ./apps/database/package.json .
COPY ./apps/database/tsdown.config.ts .
COPY ./apps/database/prisma.config.ts .
COPY ./apps/database/src/ src/

## Copy chatbot files
WORKDIR /app/apps/chatbot
COPY ./apps/chatbot/tsconfig.json .
COPY ./apps/chatbot/package.json .
COPY ./apps/chatbot/.env .

## Install dependencies
RUN npm install -g corepack@latest && corepack enable && corepack install
RUN --mount=type=secret,id=github_token,target=/tmp/github_token \
		--mount=type=cache,id=pnpm,target=/pnpm/store \
    set -eu; \
		printf "//npm.pkg.github.com/:_authToken=%s\\n" "$(cat /tmp/github_token)" > "$HOME/.npmrc"; \
    pnpm install --frozen-lockfile --filter "{.}..."; \
    rm -f "$HOME/.npmrc"

## Copy code
COPY ./apps/chatbot/src/ src/

CMD ["pnpm", "start"]
