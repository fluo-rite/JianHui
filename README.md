# lowcode

## Docker Compose

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 根据需要修改 `.env` 里的密码、端口和第三方服务密钥。

3. 启动全部服务：

```bash
docker compose up --build
```

## 默认端口

- `3000`: 统一 nginx 入口
- `3306`: MySQL
- `6379`: Redis

## 说明

- 编辑器后台通过 `/` 访问。
- 发布页通过 `/release/:id` 访问。
- 所有 `/api` 请求都由同一个 nginx 代理到后端。
- 发布页服务端渲染通过 `API_INTERNAL_BASE_URL=http://backend:3000/api` 访问后端。
- `mysql` 和 `redis` 已纳入 compose，仓库克隆后可直接按 compose 启动。
