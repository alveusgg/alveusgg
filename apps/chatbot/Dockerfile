FROM node:18.15.0-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

## Copy root files
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

## Copy chatbot files
WORKDIR apps/chatbot
COPY ./apps/chatbot/tsconfig.json .
COPY ./apps/chatbot/package.json .
COPY ./apps/chatbot/.env .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --filter "." --ignore-scripts

## Copy code
COPY ./apps/chatbot/src/ src/

CMD ["pnpm", "start"]
