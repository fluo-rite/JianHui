#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/release-switch.sh"

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

ensure_runtime_env() {
  if [[ ! -f "$APP_DIR/.env" ]]; then
    echo "runtime env file not found: $APP_DIR/.env" >&2
    exit 1
  fi
}

run_deploy() {
  SOURCE_DIR="${SOURCE_DIR:-$APP_DIR}"
  RELEASE_ID="${RELEASE_ID:-$(date +%Y%m%d%H%M%S)}"
  RELEASE_DIR="${RELEASE_DIR:-$RELEASES_DIR/$RELEASE_ID}"
  KEEP_RELEASES="${KEEP_RELEASES:-5}"
  ENABLE_MAINTENANCE_ON_DEPLOY="${ENABLE_MAINTENANCE_ON_DEPLOY:-true}"
  GIT_SHA="${GIT_SHA:-unknown}"
  GIT_REF="${GIT_REF:-unknown}"
  DEPLOYED_AT="${DEPLOYED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"

  if [[ ! -d "$SOURCE_DIR" ]]; then
    echo "source directory not found: $SOURCE_DIR" >&2
    exit 1
  fi

  for required in "$COMPOSE_FILE" "$IMAGE_ENV_FILE" "scripts/deploy.sh" "scripts/rollback.sh" "scripts/release-manage.sh" "scripts/release-switch.sh" "static"; do
    if [[ ! -e "$SOURCE_DIR/$required" ]]; then
      echo "required artifact missing: $SOURCE_DIR/$required" >&2
      exit 1
    fi
  done

  ensure_runtime_env

  if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
    switch_nginx_mode "$NGINX_MAINTENANCE_CONF" "maintenance"
  fi

  run_as_root mkdir -p "$RELEASES_DIR"
  run_as_root rm -rf "$RELEASE_DIR"
  run_as_root mkdir -p "$RELEASE_DIR"
  run_as_root cp -a "$SOURCE_DIR/." "$RELEASE_DIR/"
  write_release_meta

  docker_registry_login

  run_as_root cp "$APP_DIR/.env" "$RELEASE_DIR/runtime.env"
  install_runtime_files "$RELEASE_DIR"

  publish_static_dir "$RELEASE_DIR/static"

  compose_pull
  compose_up

  mark_current_release "$RELEASE_ID"

  if [[ "$SOURCE_DIR" != "$APP_DIR" ]]; then
    run_as_root rm -rf "$SOURCE_DIR"
  fi

  prune_old_releases

  if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
    switch_nginx_mode "$NGINX_APP_CONF" "app"
  fi

  compose_ps
}

run_rollback() {
  local target_release_id="${1:-${TARGET_RELEASE_ID:-}}"
  local release_dir="${RELEASES_DIR}/${target_release_id}"

  if [[ -z "$target_release_id" ]]; then
    echo "usage: $0 rollback <release-id>" >&2
    exit 1
  fi

  for required in "$release_dir/$COMPOSE_FILE" "$release_dir/$IMAGE_ENV_FILE" "$release_dir/static"; do
    if [[ ! -e "$required" ]]; then
      echo "release artifact missing: $required" >&2
      exit 1
    fi
  done

  ensure_runtime_env

  switch_nginx_mode "$NGINX_MAINTENANCE_CONF" "maintenance"

  docker_registry_login
  install_runtime_files "$release_dir"

  publish_static_dir "$release_dir/static"

  compose_pull
  compose_up

  mark_current_release "$target_release_id"

  switch_nginx_mode "$NGINX_APP_CONF" "app"

  compose_ps
}

usage() {
  cat >&2 <<EOF
usage:
  $0 deploy
  $0 rollback <release-id>
EOF
}

command_name="${1:-}"
case "$command_name" in
  deploy)
    shift
    run_deploy "$@"
    ;;
  rollback)
    shift
    run_rollback "$@"
    ;;
  *)
    usage
    exit 1
    ;;
esac
