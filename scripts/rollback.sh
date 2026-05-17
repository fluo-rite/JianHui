#!/usr/bin/env bash

set -Eeuo pipefail

TARGET_RELEASE_ID="${1:-${TARGET_RELEASE_ID:-}}"
APP_DIR="${APP_DIR:-/srv/jianhui/app}"
STATIC_ROOT="${STATIC_ROOT:-/var/www/html}"
DEPLOY_ROOT="${DEPLOY_ROOT:-$(dirname "$APP_DIR")}"
RELEASES_DIR="${RELEASES_DIR:-$DEPLOY_ROOT/releases}"
RELEASE_DIR="${RELEASES_DIR}/${TARGET_RELEASE_ID}"
CURRENT_RELEASE_FILE="${CURRENT_RELEASE_FILE:-$DEPLOY_ROOT/current-release}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.runtime.yml}"
IMAGE_ENV_FILE="${IMAGE_ENV_FILE:-deploy-image.env}"
CONTAINER_REGISTRY_HOST="${CONTAINER_REGISTRY_HOST:-}"
CONTAINER_REGISTRY_USERNAME="${CONTAINER_REGISTRY_USERNAME:-}"
CONTAINER_REGISTRY_PASSWORD="${CONTAINER_REGISTRY_PASSWORD:-}"
NGINX_ACTIVE_LINK="${NGINX_ACTIVE_LINK:-/etc/nginx/snippets/fluorite-active.conf}"
NGINX_APP_CONF="${NGINX_APP_CONF:-/etc/nginx/snippets/fluorite-app.conf}"
NGINX_MAINTENANCE_CONF="${NGINX_MAINTENANCE_CONF:-/etc/nginx/snippets/fluorite-maintenance.conf}"

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
  echo "Switching nginx to ${label} mode"
  run_as_root ln -sfn "$target" "$NGINX_ACTIVE_LINK"
  reload_nginx
}

if [[ -z "$TARGET_RELEASE_ID" ]]; then
  echo "usage: $0 <release-id>" >&2
  exit 1
fi

for required in "$RELEASE_DIR/$COMPOSE_FILE" "$RELEASE_DIR/$IMAGE_ENV_FILE" "$RELEASE_DIR/static"; do
  if [[ ! -e "$required" ]]; then
    echo "release artifact missing: $required" >&2
    exit 1
  fi
done

if [[ ! -f "$APP_DIR/.env" ]]; then
  echo "runtime env file not found: $APP_DIR/.env" >&2
  exit 1
fi

switch_nginx_mode "$NGINX_MAINTENANCE_CONF" "maintenance"

if [[ -n "$CONTAINER_REGISTRY_HOST" && -n "$CONTAINER_REGISTRY_USERNAME" && -n "$CONTAINER_REGISTRY_PASSWORD" ]]; then
  printf '%s\n' "$CONTAINER_REGISTRY_PASSWORD" | run_as_root docker login "$CONTAINER_REGISTRY_HOST" -u "$CONTAINER_REGISTRY_USERNAME" --password-stdin
fi

run_as_root mkdir -p "$APP_DIR" "$STATIC_ROOT"
run_as_root cp "$RELEASE_DIR/$COMPOSE_FILE" "$APP_DIR/$COMPOSE_FILE"
run_as_root cp "$RELEASE_DIR/$IMAGE_ENV_FILE" "$APP_DIR/$IMAGE_ENV_FILE"
run_as_root cp "$RELEASE_DIR/scripts/rollback.sh" "$APP_DIR/rollback.sh"
run_as_root chmod +x "$APP_DIR/rollback.sh"

run_as_root find "$STATIC_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
run_as_root cp -a "$RELEASE_DIR/static/." "$STATIC_ROOT/"

run_as_root docker compose \
  --env-file "$APP_DIR/.env" \
  --env-file "$APP_DIR/$IMAGE_ENV_FILE" \
  -f "$APP_DIR/$COMPOSE_FILE" \
  pull

run_as_root docker compose \
  --env-file "$APP_DIR/.env" \
  --env-file "$APP_DIR/$IMAGE_ENV_FILE" \
  -f "$APP_DIR/$COMPOSE_FILE" \
  up -d --remove-orphans

echo "$TARGET_RELEASE_ID" | run_as_root tee "$CURRENT_RELEASE_FILE" >/dev/null

switch_nginx_mode "$NGINX_APP_CONF" "app"

run_as_root docker compose \
  --env-file "$APP_DIR/.env" \
  --env-file "$APP_DIR/$IMAGE_ENV_FILE" \
  -f "$APP_DIR/$COMPOSE_FILE" \
  ps
