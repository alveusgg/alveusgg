FROM node:24-alpine
ENV CI="true"

## Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN wget -qO /tmp/install-pnpm.sh https://get.pnpm.io/install.sh && \
  echo "44dfbba11a70a9751090894a07f8d64c9f7954cb782dfe39a1f2b2753e1d5eea  /tmp/install-pnpm.sh" | sha256sum -c - && \
  ENV="$HOME/.shrc" SHELL="$(which sh)" sh /tmp/install-pnpm.sh && \
  rm /tmp/install-pnpm.sh

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
RUN --mount=type=secret,id=github_token,target=/tmp/github_token \
		--mount=type=cache,id=pnpm,target=/pnpm/store \
    set -eu; \
		printf "//npm.pkg.github.com/:_authToken=%s\\n" "$(cat /tmp/github_token)" > "$HOME/.npmrc"; \
    pnpm install --frozen-lockfile --filter "{.}..."; \
    rm -f "$HOME/.npmrc"

## Copy code
COPY ./apps/chatbot/src/ src/

CMD ["pnpm", "start"]
