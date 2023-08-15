FROM node:18.15.0-alpine

RUN npm install -g pnpm

COPY package.json .

RUN pnpm install

COPY src/ src/
COPY tsconfig.json .
COPY .env .

CMD ["pnpm", "start"]
