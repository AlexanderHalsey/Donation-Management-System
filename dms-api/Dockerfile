FROM node:25-alpine AS base

ENV CI=1
WORKDIR /app

RUN addgroup -g 1001 -S dms && \
  adduser -S dms -u 1001 -G dms && \
  mkdir -p /home/dms && \
  chown -R dms:dms /home/dms /app

USER dms

COPY --chown=dms:dms dms-api/package*.json ./dms-api/

WORKDIR /app/dms-api

RUN npm ci --omit=dev

FROM base AS builder

WORKDIR /app/dms-api/

RUN npm ci

COPY --chown=dms:dms dms-api/src/ ./src/
COPY --chown=dms:dms shared/ ../shared/
COPY --chown=dms:dms dms-api/tsconfig*.json ./
COPY --chown=dms:dms dms-api/nest-cli.json ./
COPY --chown=dms:dms dms-api/prisma ./prisma/

RUN npx prisma generate
RUN npm run build

FROM base AS runtime

WORKDIR /app/dms-api/

COPY --from=builder --chown=dms:dms /app/dms-api/dist ./dist
COPY --from=builder --chown=dms:dms /app/dms-api/src/generated/prisma ./src/generated/prisma
COPY --from=builder --chown=dms:dms /app/dms-api/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/dms-api/src/main"]
