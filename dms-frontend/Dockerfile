FROM node:25-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY dms-frontend/package.json ./dms-frontend/

RUN npm install

WORKDIR /app/dms-frontend

COPY dms-frontend/src/ ./src/
COPY dms-frontend/public/ ./public/
COPY dms-frontend/*config* ./
COPY dms-frontend/.env* ./
COPY dms-frontend/env.d.ts ./
COPY dms-frontend/index.html ./
COPY shared/ ../shared/

RUN npm run build

FROM builder AS testrunner

WORKDIR /app/dms-frontend

CMD ["npm", "run", "test"]

FROM nginxinc/nginx-unprivileged:alpine AS production

WORKDIR /app/dms-frontend

COPY dms-frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dms-frontend/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
