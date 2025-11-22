
#!/bin/bash
set -e

if [ ! -f .env ]; then
  echo ".env file not found."
  exit 1
fi

export $(grep -v '^#' .env | xargs)

docker run -d \
  --name payanywhere-api \
  --env-file .env \
  -p "$PORT":"$PORT" \
  payanywhere-api
