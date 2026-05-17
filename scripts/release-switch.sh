#!/usr/bin/env bash

APP_DIR="${APP_DIR:-/srv/jianhui/app}"
STATIC_ROOT="${STATIC_ROOT:-/var/www/html}"
DEPLOY_ROOT="${DEPLOY_ROOT:-$(dirname "$APP_DIR")}"
RELEASES_DIR="${RELEASES_DIR:-$DEPLOY_ROOT/releases}"
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

  if [[ ! -f "$target" ]]; then
    echo "nginx mode config not found: $target" >&2
    exit 1
  fi

  echo "Switching nginx to ${label} mode"
  run_as_root ln -sfn "$target" "$NGINX_ACTIVE_LINK"
  reload_nginx
}

docker_registry_login() {
  if [[ -n "$CONTAINER_REGISTRY_HOST" && -n "$CONTAINER_REGISTRY_USERNAME" && -n "$CONTAINER_REGISTRY_PASSWORD" ]]; then
    printf '%s\n' "$CONTAINER_REGISTRY_PASSWORD" | run_as_root docker login "$CONTAINER_REGISTRY_HOST" -u "$CONTAINER_REGISTRY_USERNAME" --password-stdin
  fi
}

compose_pull() {
  run_as_root docker compose \
    --env-file "$APP_DIR/.env" \
    --env-file "$APP_DIR/$IMAGE_ENV_FILE" \
    -f "$APP_DIR/$COMPOSE_FILE" \
    pull
}

compose_up() {
  run_as_root docker compose \
    --env-file "$APP_DIR/.env" \
    --env-file "$APP_DIR/$IMAGE_ENV_FILE" \
    -f "$APP_DIR/$COMPOSE_FILE" \
    up -d --remove-orphans
}

compose_ps() {
  run_as_root docker compose \
    --env-file "$APP_DIR/.env" \
    --env-file "$APP_DIR/$IMAGE_ENV_FILE" \
    -f "$APP_DIR/$COMPOSE_FILE" \
    ps
}

install_runtime_files() {
  local release_dir="$1"

  run_as_root mkdir -p "$APP_DIR" "$STATIC_ROOT"
  run_as_root cp "$release_dir/$COMPOSE_FILE" "$APP_DIR/$COMPOSE_FILE"
  run_as_root cp "$release_dir/$IMAGE_ENV_FILE" "$APP_DIR/$IMAGE_ENV_FILE"
  run_as_root cp "$release_dir/scripts/release-switch.sh" "$APP_DIR/release-switch.sh"
  run_as_root cp "$release_dir/scripts/release-manage.sh" "$APP_DIR/release-manage.sh"
  run_as_root cp "$release_dir/scripts/deploy.sh" "$APP_DIR/deploy.sh"
  run_as_root cp "$release_dir/scripts/rollback.sh" "$APP_DIR/rollback.sh"
  run_as_root chmod +x "$APP_DIR/release-switch.sh" "$APP_DIR/release-manage.sh" "$APP_DIR/deploy.sh" "$APP_DIR/rollback.sh"
}

publish_static_dir() {
  local static_dir="$1"

  run_as_root find "$STATIC_ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  run_as_root cp -a "$static_dir/." "$STATIC_ROOT/"
}

mark_current_release() {
  local release_id="$1"
  echo "$release_id" | run_as_root tee "$CURRENT_RELEASE_FILE" >/dev/null
}
