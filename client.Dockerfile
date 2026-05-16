FROM node:18-alpine AS builder

WORKDIR /app

COPY . /app

ARG VITE_API_BASE_URL=/api
ARG VITE_RELEASE_BASE_URL=http://localhost:3000/release

RUN npm config set registry https://registry.npmmirror.com

RUN npm install pnpm -g

RUN pnpm install --frozen-lockfile

RUN pnpm build:share

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_RELEASE_BASE_URL=${VITE_RELEASE_BASE_URL}

RUN pnpm build:client

FROM nginx:1.25.0-alpine

COPY nginx/client.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

EXPOSE 80
