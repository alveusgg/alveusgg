FROM node:24-alpine
ENV CI="true"

## Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN wget -qO- https://get.pnpm.io/install.sh | tee /tmp/install-pnpm.sh | \
  sha256sum -c <(echo "a9949c8e3e8dd7b8e8bdee141e778dfce51784910d7011a5730586ea3d39a4ac  -") && \
  ENV="$HOME/.shrc" SHELL="$(which sh)" sh /tmp/install-pnpm.sh && \
  rm /tmp/install-pnpm.sh

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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter "{.}..."

## Copy code
COPY ./apps/chatbot/src/ src/

CMD ["pnpm", "start"]
