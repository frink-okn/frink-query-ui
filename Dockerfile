FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

# Env vars, no I don't know why it has to be done this way
ARG VITE_GH_REPO
ENV VITE_GH_REPO=${VITE_GH_REPO}

ARG VITE_GH_SOURCES
ENV VITE_GH_SOURCES=${VITE_GH_SOURCES}

ARG VITE_GH_EXAMPLES_DIRECTORY
ENV VITE_GH_EXAMPLES_DIRECTORY=${VITE_GH_EXAMPLES_DIRECTORY}

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM bitnami/nginx:latest
WORKDIR /app
COPY --from=builder /app/dist /opt/bitnami/nginx/html/
COPY ./server.conf /opt/bitnami/nginx/conf/server_blocks/server.conf
CMD ["nginx", "-g", "daemon off;"]