#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/srv/jianhui/app}"
SOURCE_DIR="${SOURCE_DIR:-$APP_DIR}"
STATIC_ROOT="${STATIC_ROOT:-/var/www/html}"
DEPLOY_ROOT="${DEPLOY_ROOT:-$(dirname "$APP_DIR")}"
RELEASES_DIR="${RELEASES_DIR:-$DEPLOY_ROOT/releases}"
RELEASE_ID="${RELEASE_ID:-$(date +%Y%m%d%H%M%S)}"
RELEASE_DIR="${RELEASE_DIR:-$RELEASES_DIR/$RELEASE_ID}"
CURRENT_RELEASE_FILE="${CURRENT_RELEASE_FILE:-$DEPLOY_ROOT/current-release}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.runtime.yml}"
IMAGE_ENV_FILE="${IMAGE_ENV_FILE:-deploy-image.env}"
CONTAINER_REGISTRY_HOST="${CONTAINER_REGISTRY_HOST:-}"
CONTAINER_REGISTRY_USERNAME="${CONTAINER_REGISTRY_USERNAME:-}"
CONTAINER_REGISTRY_PASSWORD="${CONTAINER_REGISTRY_PASSWORD:-}"
NGINX_ACTIVE_LINK="${NGINX_ACTIVE_LINK:-/etc/nginx/snippets/fluorite-active.conf}"
NGINX_APP_CONF="${NGINX_APP_CONF:-/etc/nginx/snippets/fluorite-app.conf}"
NGINX_MAINTENANCE_CONF="${NGINX_MAINTENANCE_CONF:-/etc/nginx/snippets/fluorite-maintenance.conf}"
ENABLE_MAINTENANCE_ON_DEPLOY="${ENABLE_MAINTENANCE_ON_DEPLOY:-true}"
GIT_SHA="${GIT_SHA:-unknown}"
GIT_REF="${GIT_REF:-unknown}"
DEPLOYED_AT="${DEPLOYED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"

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

write_release_meta() {
  cat <<EOF | run_as_root tee "$RELEASE_DIR/deploy-meta.env" >/dev/null
RELEASE_ID=$RELEASE_ID
GIT_SHA=$GIT_SHA
GIT_REF=$GIT_REF
DEPLOYED_AT=$DEPLOYED_AT
APP_DIR=$APP_DIR
STATIC_ROOT=$STATIC_ROOT
EOF
}

prune_old_releases() {
  run_as_root bash -lc "
    set -e
    cd '$RELEASES_DIR'
    ls -1dt */ 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
  "
}

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

for required in "$COMPOSE_FILE" "$IMAGE_ENV_FILE" "scripts/rollback.sh" "static"; do
  if [[ ! -e "$SOURCE_DIR/$required" ]]; then
    echo "required artifact missing: $SOURCE_DIR/$required" >&2
    exit 1
  fi
done

if [[ ! -f "$APP_DIR/.env" ]]; then
  echo "runtime env file not found: $APP_DIR/.env" >&2
  exit 1
fi

if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
  switch_nginx_mode "$NGINX_MAINTENANCE_CONF" "maintenance"
fi

run_as_root mkdir -p "$RELEASES_DIR"
run_as_root rm -rf "$RELEASE_DIR"
run_as_root mkdir -p "$RELEASE_DIR"
run_as_root cp -a "$SOURCE_DIR/." "$RELEASE_DIR/"
write_release_meta

if [[ -n "$CONTAINER_REGISTRY_HOST" && -n "$CONTAINER_REGISTRY_USERNAME" && -n "$CONTAINER_REGISTRY_PASSWORD" ]]; then
  printf '%s\n' "$CONTAINER_REGISTRY_PASSWORD" | run_as_root docker login "$CONTAINER_REGISTRY_HOST" -u "$CONTAINER_REGISTRY_USERNAME" --password-stdin
fi

run_as_root mkdir -p "$APP_DIR" "$STATIC_ROOT"
run_as_root cp "$APP_DIR/.env" "$RELEASE_DIR/runtime.env"
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

echo "$RELEASE_ID" | run_as_root tee "$CURRENT_RELEASE_FILE" >/dev/null

if [[ "$SOURCE_DIR" != "$APP_DIR" ]]; then
  run_as_root rm -rf "$SOURCE_DIR"
fi

prune_old_releases

if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
  switch_nginx_mode "$NGINX_APP_CONF" "app"
fi

run_as_root docker compose \
  --env-file "$APP_DIR/.env" \
  --env-file "$APP_DIR/$IMAGE_ENV_FILE" \
  -f "$APP_DIR/$COMPOSE_FILE" \
  ps
