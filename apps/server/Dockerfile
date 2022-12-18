FROM node:18-alpine

COPY package.json .

RUN npm install

COPY server.cjs .

RUN node server.cjs