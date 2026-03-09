FROM node:25-alpine AS base

ENV CI=1
WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S dms && \
  adduser -S dms -u 1001 -G dms && \
  mkdir -p /home/dms && \
  chown -R dms:dms /home/dms /app

USER dms

COPY --chown=dms:dms package*.json ./
COPY --chown=dms:dms dms-api/package.json ./dms-api/

RUN npm ci --omit=dev

FROM base AS builder

WORKDIR /app

RUN npm ci

WORKDIR /app/dms-api

COPY --chown=dms:dms dms-api/src/ ./src/
COPY --chown=dms:dms shared/ ../shared/
COPY --chown=dms:dms dms-api/tsconfig*.json ./
COPY --chown=dms:dms dms-api/nest-cli.json ./
COPY --chown=dms:dms dms-api/prisma.config.ts ./
COPY --chown=dms:dms dms-api/prisma/ ./prisma/
COPY --chown=dms:dms dms-api/startup.sh ./

RUN chmod +x ./startup.sh

# Set a dummy database URL for Prisma code generation
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate
RUN npm run build

FROM base AS runtime

WORKDIR /app/dms-api

COPY --from=builder --chown=dms:dms /app/dms-api/dist ./dist
COPY --from=builder --chown=dms:dms /app/dms-api/prisma.config.ts ./
COPY --from=builder --chown=dms:dms /app/dms-api/prisma ./prisma
COPY --from=builder --chown=dms:dms /app/dms-api/startup.sh ./
COPY --from=builder --chown=dms:dms /app/dms-api/tsconfig.json ./

EXPOSE 3000

CMD ["/bin/sh", "./startup.sh"]
