FROM node:24-alpine
ENV CI="true"

## Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN wget -qO /tmp/install-pnpm.sh https://get.pnpm.io/install.sh && ENV="$HOME/.shrc" SHELL="$(which sh)" sh /tmp/install-pnpm.sh

RUN pnpm --version
RUN node --version

WORKDIR /app
RUN echo '{ "packageManager": "pnpm@11.26.0" }' > package.json
RUN pnpm --version
RUN exit 1
