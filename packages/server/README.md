# Server

当前服务端已经从 NestJS 迁移为 Express + TypeORM。

## 目录

- `src/app.ts`: 应用装配入口
- `src/main.ts`: 启动入口
- `src/modules`: 业务模块
- `src/entities`: TypeORM 实体
- `src/config`: 数据库、JWT、OSS 等配置
- `src-nest-legacy`: 迁移时保留的旧 NestJS 参考代码

## 常用命令

```bash
pnpm --filter server run build
pnpm --filter server run start:dev
pnpm --filter server run start:prod
```

## 说明

- 当前生产入口为 `dist/main.js`
- 发布页服务 `packages/release` 通过 `/api/*` 调用本服务
- 如果后续确认不再需要对照旧实现，可以删除 `src-nest-legacy`
