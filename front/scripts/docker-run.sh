#!/bin/bash
set -e

# Default port if not provided
PORT=${PORT:-3000}

# Load .env if it exists
if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

# Run container safely
docker run -it --rm \
  -p "${PORT}:3000" \
  -e NEXT_PUBLIC_ENVIRONMENT="${NEXT_PUBLIC_ENVIRONMENT}" \
  -e NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
  payanywhere-front
