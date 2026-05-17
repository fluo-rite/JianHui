# 简汇低代码营销问卷平台

简汇低代码营销问卷平台，提供图片、轮播图、视频等可视化组件与多类问卷表单组件，轻松搭建营销问卷页面；发布后可在后台一站式查看页面访问及问卷回收统计数据。

## 本地启动

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 根据需要修改 `.env`。

3. 启动全部服务：

```bash
docker compose up --build
```

## 默认访问方式

- 编辑器后台：`/`
- 发布页：`/release/:id`
- API：`/api/*`

## 目录说明

- `packages/client`：后台编辑端
- `packages/release`：对外发布页
- `packages/server`：后端服务
- `packages/share`：共享组件与类型

## 说明

- `mysql` 和 `redis` 已纳入 compose，仓库克隆后可直接按 compose 启动。
- `.env.example` 仅为本地/示例配置模板，实际运行请按环境单独配置。
