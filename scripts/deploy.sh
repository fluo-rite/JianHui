#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/srv/jianhui/app}"
STATIC_ROOT="${STATIC_ROOT:-/var/www/html}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
CLIENT_BUILD_IMAGE="${CLIENT_BUILD_IMAGE:-jianhui-client-build:latest}"
CLIENT_BUILD_CONTAINER="${CLIENT_BUILD_CONTAINER:-jianhui-client-build-container}"
STATIC_STAGING_DIR="${STATIC_STAGING_DIR:-$APP_DIR/.deploy-static}"
NGINX_ACTIVE_LINK="${NGINX_ACTIVE_LINK:-/etc/nginx/snippets/fluorite-active.conf}"
NGINX_APP_CONF="${NGINX_APP_CONF:-/etc/nginx/snippets/fluorite-app.conf}"
NGINX_MAINTENANCE_CONF="${NGINX_MAINTENANCE_CONF:-/etc/nginx/snippets/fluorite-maintenance.conf}"
ENABLE_MAINTENANCE_ON_DEPLOY="${ENABLE_MAINTENANCE_ON_DEPLOY:-true}"

run_as_root() {
  sudo "$@"
}

reload_nginx() {
  run_as_root nginx -t
  run_as_root systemctl reload nginx
}

switch_nginx_mode() {
  local target="$1"
  local label="$2"

  if [[ ! -f "$target" ]]; then
    echo "nginx mode config not found: $target" >&2
    exit 1
  fi

  echo "Switching nginx to ${label} mode"
  run_as_root ln -sfn "$target" "$NGINX_ACTIVE_LINK"
  reload_nginx
}

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed on the server" >&2
  exit 1
fi

cd "$APP_DIR"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

test -n "$APP_DIR"
test "$APP_DIR" != "/"
test -n "$STATIC_ROOT"
test "$STATIC_ROOT" != "/"
test -n "$STATIC_STAGING_DIR"
test "$STATIC_STAGING_DIR" != "/"

if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
  switch_nginx_mode "$NGINX_MAINTENANCE_CONF" "maintenance"
fi

set -a
. "$APP_DIR/.env"
set +a

run_as_root docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

run_as_root docker build \
  --target builder \
  --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api}" \
  --build-arg VITE_RELEASE_BASE_URL="${VITE_RELEASE_BASE_URL:-https://fluorite.cyou/release}" \
  -t "$CLIENT_BUILD_IMAGE" \
  -f client.Dockerfile \
  .

run_as_root docker rm -f "$CLIENT_BUILD_CONTAINER" >/dev/null 2>&1 || true
run_as_root docker create --name "$CLIENT_BUILD_CONTAINER" "$CLIENT_BUILD_IMAGE" >/dev/null

rm -rf "$STATIC_STAGING_DIR"
mkdir -p "$STATIC_STAGING_DIR"
run_as_root mkdir -p "$STATIC_ROOT"
run_as_root find "$STATIC_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
run_as_root docker cp "$CLIENT_BUILD_CONTAINER:/app/packages/client/dist/." "$STATIC_STAGING_DIR"
run_as_root cp -a "$STATIC_STAGING_DIR/." "$STATIC_ROOT/"
run_as_root docker rm -f "$CLIENT_BUILD_CONTAINER" >/dev/null
rm -rf "$STATIC_STAGING_DIR"

if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
  switch_nginx_mode "$NGINX_APP_CONF" "app"
fi

run_as_root docker image prune -f >/dev/null 2>&1 || true
run_as_root docker compose -f "$COMPOSE_FILE" ps
