# Alpine image
FROM node:22.15.0-alpine3.20 AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat git

# Setup pnpm and turbo on the alpine base
FROM alpine AS base
RUN npm install pnpm@latest turbo@latest --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner
ARG PROJECT

ENV TURBO_TELEMETRY_DISABLED=1
ENV DO_NOT_TRACK=1
ENV CI=1

WORKDIR /app
COPY . .
RUN turbo prune --scope=${PROJECT} --docker

# Build the project
FROM base AS builder
ARG PROJECT

# Define build-time arguments for the specified environment variables
ARG DATABASE_URL
ARG AUTH_URL
ARG AUTH_SECRET
ARG AUTH_ISSUER_URL
ARG AUTH_CLIENT_ID
ARG AUTH_CLIENT_SECRET
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ASSETS_URL
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_TYPESENSE_HOST
ARG NEXT_PUBLIC_TYPESENSE_PORT
ARG NEXT_PUBLIC_TYPESENSE_PROTOCOL
ARG NEXT_PUBLIC_TYPESENSE_SEARCH_KEY

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# First install the dependencies (as they change less often)
# Disable Husky during Docker build to prevent prepare script errors
ENV HUSKY=0
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --no-frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client
RUN pnpm --filter @terraviva/db-catalogo-pft run build

# Set only the specified environment variables for the build stage
ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH_URL=${AUTH_URL:-"http://localhost:3000/auth"}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV AUTH_ISSUER_URL=${AUTH_ISSUER_URL:-"http://localhost:3000/auth"}
ENV AUTH_CLIENT_ID=${AUTH_CLIENT_ID:-"dummy-client-id-for-build"}
ENV AUTH_CLIENT_SECRET=${AUTH_CLIENT_SECRET:-"dummy-client-secret-for-build"}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_ASSETS_URL=${NEXT_PUBLIC_ASSETS_URL}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV NEXT_PUBLIC_TYPESENSE_HOST=${NEXT_PUBLIC_TYPESENSE_HOST}
ENV NEXT_PUBLIC_TYPESENSE_PORT=${NEXT_PUBLIC_TYPESENSE_PORT}
ENV NEXT_PUBLIC_TYPESENSE_PROTOCOL=${NEXT_PUBLIC_TYPESENSE_PROTOCOL}
ENV NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=${NEXT_PUBLIC_TYPESENSE_SEARCH_KEY}
ENV TYPESENSE_PROTOCOL=${TYPESENSE_PROTOCOL}
ENV TYPESENSE_API_KEY=${TYPESENSE_API_KEY}
# Set dummy values for auth variables during build to prevent validation errors
ENV AUTH_CLIENT_ID=${AUTH_CLIENT_ID:-"dummy-client-id-for-build"}
ENV AUTH_CLIENT_SECRET=${AUTH_CLIENT_SECRET:-"dummy-client-secret-for-build"}
ENV AUTH_ISSUER_URL=${AUTH_ISSUER_URL:-"http://localhost:3000/auth"}

RUN NODE_OPTIONS="--max_old_space_size=4096" turbo build --env-mode=loose --filter=${PROJECT}...
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

# Final image
FROM alpine AS runner
ARG PROJECT

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder /app/apps/web/next.config.mjs .
COPY --from=builder /app/apps/web/package.json .

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy Prisma generated files and binaries
COPY --from=builder --chown=nextjs:nodejs /app/packages/db-catalogo-pft/generated ./packages/db-catalogo-pft/generated

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1

# Configure Prisma to use correct binary for Alpine Linux
ENV PRISMA_QUERY_ENGINE_LIBRARY="/app/packages/db-catalogo-pft/generated/prisma/libquery_engine-linux-musl-openssl-3.0.x.so.node"
ENV PRISMA_QUERY_ENGINE_BINARY="/app/packages/db-catalogo-pft/generated/prisma/query-engine-linux-musl-openssl-3.0.x"

EXPOSE 3000

CMD ["node", "apps/web/server.js"]