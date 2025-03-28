FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG VITE_KG_SOURCES_YAML
ENV VITE_KG_SOURCES_YAML=${VITE_KG_SOURCES_YAML}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM bitnami/nginx:latest
WORKDIR /app
COPY --from=builder /app/dist /opt/bitnami/nginx/html/
COPY ./server.conf /opt/bitnami/nginx/conf/server_blocks/server.conf
CMD ["nginx", "-g", "daemon off;"]