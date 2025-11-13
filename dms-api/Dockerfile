FROM node:25-alpine AS base

ENV CI=1
WORKDIR /app

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
COPY --chown=dms:dms dms-api/prisma/ ./prisma/

RUN npx prisma generate
RUN npm run build

FROM builder AS testrunner

WORKDIR /app/dms-api

CMD ["npm", "run", "test"]

FROM base AS runtime

WORKDIR /app/dms-api

COPY --from=builder --chown=dms:dms /app/dms-api/dist ./dist
COPY --from=builder --chown=dms:dms /app/dms-api/prisma/schema.prisma ./prisma/
COPY --from=builder --chown=dms:dms /app/dms-api/prisma/migrations ./prisma/migrations

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/dms-api/src/main"]
