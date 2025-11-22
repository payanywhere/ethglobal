#!/bin/bash
set -e

if [ ! -f .env ]; then
  echo ".env file not found."
  exit 1
fi

# Safely load environment variables from .env
set -o allexport
source .env
set +o allexport

docker build \
  --build-arg NEXT_PUBLIC_ENVIRONMENT="$NEXT_PUBLIC_ENVIRONMENT" \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -t payanywhere-front .
