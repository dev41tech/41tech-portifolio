FROM node:22-slim AS base
RUN npm install -g pnpm@10

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/41tech/package.json ./artifacts/41tech/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY scripts/package.json ./scripts/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .

ARG BASE_URL=/
ENV BASE_URL=${BASE_URL}
ENV BASE_PATH=${BASE_URL}
ENV NODE_ENV=production
ENV PORT=8080

RUN pnpm --filter @workspace/41tech run build
RUN pnpm --filter @workspace/api-server run build

FROM node:22-slim AS runner
WORKDIR /app

RUN npm install -g pnpm@10

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/41tech/dist/public ./frontend

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY --from=builder /app/lib/db/package.json ./lib/db/package.json
COPY --from=builder /app/lib/api-zod/package.json ./lib/api-zod/package.json
COPY --from=builder /app/lib/api-client-react/package.json ./lib/api-client-react/package.json

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY --from=builder /app/lib/db/src ./lib/db/src
COPY --from=builder /app/lib/api-zod/src ./lib/api-zod/src

ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_DIST_PATH=/app/frontend

EXPOSE 3000

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
