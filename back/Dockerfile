FROM oven/bun:1.1 AS builder
WORKDIR /app

COPY bun.lockb package.json tsconfig.json ./
RUN bun install --frozen-lockfile

ARG BUN_ENV
ARG MONGO_URI

ENV BUN_ENV=$BUN_ENV
ENV NODE_ENV=production
ENV MONGO_URI=$MONGO_URI
ENV RPC_PROVIDER=$RPC_PROVIDER
ENV PRIVATE_KEY=$PRIVATE_KEY

COPY src ./src
RUN bun build ./src/server.ts --outdir dist --target bun

FROM oven/bun:1.1-slim AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY bun.lockb package.json ./
RUN bun install --production --frozen-lockfile

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["bun", "run", "dist/server.js"]