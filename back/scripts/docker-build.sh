#!/bin/bash
set -e

if [ ! -f .env ]; then
  echo ".env file not found."
  exit 1
fi

# Load .env safely and export variables
export $(grep -v '^#' .env | xargs -d '\n')

# Optional debug output
echo "Building with:"
echo "  MONGO_URI=$MONGO_URI"
echo "  PORT=$PORT"

docker build \
  --build-arg MONGO_URI="${MONGO_URI}" \
  --build-arg PORT="${PORT}" \
  -t payanywhere-api .
