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

## 生产部署结构

当前生产部署适配的是：

- 宿主机 Nginx 负责 `80 -> 443`、SSL 证书、维护模式切换、静态资源分发
- Docker 只运行 `mysql`、`redis`、`backend`、`release`
- `client` 前端在 GitHub Actions 中构建成静态资源后上传到服务器

相关文件：

- 工作流：[.github/workflows/deploy.yml](/Users/tanwen/code/lowcode/.github/workflows/deploy.yml:1)
- 运行时 compose：[docker-compose.runtime.yml](/Users/tanwen/code/lowcode/docker-compose.runtime.yml:1)
- 部署脚本：[scripts/deploy.sh](/Users/tanwen/code/lowcode/scripts/deploy.sh:1)
- 回滚脚本：[scripts/rollback.sh](/Users/tanwen/code/lowcode/scripts/rollback.sh:1)

## 当前自动部署流程

现在这套流程是“产物化部署”，不是把源码传到服务器再现场构建：

1. GitHub Actions 安装依赖并构建 `client` 静态资源
2. GitHub Actions 构建 `backend` 与 `release` Docker 镜像
3. GitHub Actions 导出镜像 tar 包，连同静态资源、运行时 compose、部署脚本一起打成 release bundle
4. bundle 上传到服务器
5. 服务器切换到维护模式
6. 服务器解压 bundle、导入镜像、更新静态资源、启动容器
7. 部署成功后切回正常模式

如果部署失败，站点会停留在维护模式，避免把半更新状态暴露出去。

## 服务器目录结构

默认目录结构如下：

```text
/srv/jianhui/
  app/
    .env
    docker-compose.runtime.yml
    deploy-image.env
    rollback.sh
  current-release
  incoming/
    <release-id>/
  releases/
    <release-id>/
      static/
      images/
      scripts/
      docker-compose.runtime.yml
      deploy-image.env
      release-meta.env
      deploy-meta.env
```

其中：

- `incoming/<release-id>`：本次上传的临时 bundle 解压目录
- `releases/<release-id>`：保留下来的历史版本快照
- `current-release`：当前线上生效的版本号

## 回滚机制

服务器默认保留最近 `5` 次部署快照。

查看当前版本：

```bash
cat /srv/jianhui/current-release
```

查看可回滚版本：

```bash
ls -lah /srv/jianhui/releases
```

回滚到指定版本：

```bash
cd /srv/jianhui/app
sudo ./rollback.sh <release-id>
```

回滚逻辑：

- 切到维护模式
- 从对应 release 重新导入镜像 tar
- 恢复静态资源
- 用该版本的镜像标签重新 `docker compose up -d`
- 切回正常模式

## GitHub Actions Secrets

至少需要这些 Secret：

- `SERVER_HOST`
- `SERVER_PORT`
- `SERVER_USER`
- `SERVER_SSH_KEY`
- `DEPLOY_PATH`
- `PROD_ENV_FILE`
- `STATIC_ROOT`
- `NGINX_ACTIVE_LINK`
- `NGINX_APP_CONF`
- `NGINX_MAINTENANCE_CONF`

如果要启用失败邮件，再补：

- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `ALERT_EMAIL_FROM`
- `ALERT_EMAIL_TO`

推荐和你当前服务器配置对齐的值：

- `DEPLOY_PATH`
  `/srv/jianhui/app`
- `STATIC_ROOT`
  `/var/www/html`
- `NGINX_ACTIVE_LINK`
  `/etc/nginx/snippets/fluorite-active.conf`
- `NGINX_APP_CONF`
  `/etc/nginx/snippets/fluorite-app.conf`
- `NGINX_MAINTENANCE_CONF`
  `/etc/nginx/snippets/fluorite-maintenance.conf`

## 宿主机 Nginx

如果你使用当前服务器的配置结构，`fluorite-active.conf` 会在两种模式之间切换：

- 正常模式：`fluorite-app.conf`
- 维护模式：`fluorite-maintenance.conf`

部署脚本会自动：

1. 切到维护模式
2. 校验并 reload nginx
3. 部署成功后切回正常模式

## 生产环境变量

`PROD_ENV_FILE` 可参考 [.env.example](/Users/tanwen/code/lowcode/.env.example:1)，通常至少要包含：

```env
MYSQL_ROOT_PASSWORD=your-prod-password
MYSQL_DATABASE=jianhui-lowcode
MYSQL_HOST_PORT=3306

REDIS_PASSWORD=your-redis-password
REDIS_HOST_PORT=6379

DB_SYNCHRONIZE=false
JWT_SECRET=your-jwt-secret

BACKEND_HOST_PORT=5000
RELEASE_HOST_PORT=4000

VITE_API_BASE_URL=/api
VITE_RELEASE_BASE_URL=https://fluorite.cyou/release
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_RELEASE_BASE_PATH=/release

ALI_OSS_REGION=oss-cn-shanghai
ALI_OSS_ACCESS_KEY_ID=your-key-id
ALI_OSS_ACCESS_KEY_SECRET=your-key-secret
ALI_OSS_BUCKET=your-bucket
ALI_OSS_CUSTOM_DOMAIN=
```
