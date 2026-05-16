FROM node:18-alpine

WORKDIR /app

COPY . /app

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_RELEASE_BASE_PATH=/release

RUN npm config set registry https://registry.npmmirror.com

RUN npm install pnpm -g

RUN pnpm install --frozen-lockfile

RUN pnpm build:share

ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_RELEASE_BASE_PATH=${NEXT_PUBLIC_RELEASE_BASE_PATH}

RUN pnpm build:release

EXPOSE 3000

CMD ["pnpm", "start:release"]
