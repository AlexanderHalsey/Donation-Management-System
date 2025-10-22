FROM node:25-alpine AS base

ENV CI=1
WORKDIR /app

RUN addgroup -g 1001 -S dms && \
  adduser -S dms -u 1001 -G dms && \
  mkdir -p /home/dms && \
  chown -R dms:dms /home/dms /app

USER dms

COPY --chown=dms:dms package*.json ./
RUN npm ci --omit=dev

FROM base AS builder

RUN npm ci

COPY --chown=dms:dms src/ ./src/
COPY --chown=dms:dms tsconfig*.json nest-cli.json ./
RUN npm run build

FROM base AS runtime

COPY --from=builder --chown=dms:dms /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
