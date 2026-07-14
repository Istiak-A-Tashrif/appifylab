#!/usr/bin/env bash

set -euo pipefail

PROFILE=${1:-prod}
if [[ "$PROFILE" != "prod" && "$PROFILE" != "dev" ]]; then
  echo "Usage: ./setup.sh [prod|dev]"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop or Docker Engine first."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required."
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "OpenSSL is required to generate local secrets."
  exit 1
fi

random_secret() {
  openssl rand -hex 32
}

update_env() {
  local key=$1 value=$2
  if grep -q "^${key}=" .env 2>/dev/null; then
    if [[ "${OSTYPE:-}" == darwin* ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" .env
    else
      sed -i "s|^${key}=.*|${key}=${value}|" .env
    fi
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

touch .env
grep -q '^POSTGRES_PASSWORD=' .env || update_env POSTGRES_PASSWORD "$(random_secret)"
grep -q '^JWT_SECRET=' .env || update_env JWT_SECRET "$(random_secret)"
grep -q '^JWT_REFRESH_SECRET=' .env || update_env JWT_REFRESH_SECRET "$(random_secret)"
grep -q '^CSRF_SECRET=' .env || update_env CSRF_SECRET "$(random_secret)"
grep -q '^FRONTEND_URL=' .env || update_env FRONTEND_URL "http://localhost:5173"
grep -q '^NEXT_PUBLIC_API_URL=' .env || update_env NEXT_PUBLIC_API_URL "http://localhost:3000"
grep -q '^NEXT_PUBLIC_CLOUD_NAME=' .env || update_env NEXT_PUBLIC_CLOUD_NAME "ddluuftiq"
grep -q '^NEXT_PUBLIC_UPLOAD_PRESET=' .env || update_env NEXT_PUBLIC_UPLOAD_PRESET "test-preset"

echo "Starting Appify Community Feed with the '${PROFILE}' profile..."
docker compose --profile "$PROFILE" up --build -d
docker compose --profile "$PROFILE" ps

echo
echo "Frontend: http://localhost:5173"
echo "API:      http://localhost:3000/api"
echo "Stop:     docker compose --profile ${PROFILE} down"
