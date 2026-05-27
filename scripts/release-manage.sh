#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/release-switch.sh"

ensure_runtime_env() {
  if [[ ! -f "$APP_DIR/.env" ]]; then
    echo "runtime env file not found: $APP_DIR/.env" >&2
    exit 1
  fi
}

run_deploy() {
  SOURCE_DIR="${SOURCE_DIR:-$APP_DIR}"
  ENABLE_MAINTENANCE_ON_DEPLOY="${ENABLE_MAINTENANCE_ON_DEPLOY:-true}"

  if [[ ! -d "$SOURCE_DIR" ]]; then
    echo "source directory not found: $SOURCE_DIR" >&2
    exit 1
  fi

  for required in "$COMPOSE_FILE" "$IMAGE_ENV_FILE" "db/init-schema.sql" "scripts/deploy.sh" "scripts/release-manage.sh" "scripts/release-switch.sh" "static"; do
    if [[ ! -e "$SOURCE_DIR/$required" ]]; then
      echo "required artifact missing: $SOURCE_DIR/$required" >&2
      exit 1
    fi
  done

  ensure_runtime_env

  if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
    switch_nginx_mode "$NGINX_MAINTENANCE_CONF" "maintenance"
  fi

  docker_registry_login

  install_runtime_files "$SOURCE_DIR"
  publish_static_dir "$SOURCE_DIR/static"

  compose_down
  compose_pull
  compose_up

  if [[ "$SOURCE_DIR" != "$APP_DIR" ]]; then
    run_as_root rm -rf "$SOURCE_DIR"
  fi

  if [[ "$ENABLE_MAINTENANCE_ON_DEPLOY" == "true" ]]; then
    switch_nginx_mode "$NGINX_APP_CONF" "app"
  fi

  compose_ps
  cleanup_docker_artifacts
}

usage() {
  cat >&2 <<EOF
usage:
  $0 deploy
EOF
}

command_name="${1:-}"
case "$command_name" in
  deploy)
    shift
    run_deploy "$@"
    ;;
  *)
    usage
    exit 1
    ;;
esac
