FROM node:18-alpine

WORKDIR /app

COPY . /app

RUN npm config set registry https://registry.npmmirror.com

RUN npm install pnpm -g

RUN pnpm install --frozen-lockfile

RUN pnpm build:share

RUN pnpm build:server

EXPOSE 3000

CMD ["pnpm", "start:server"]
