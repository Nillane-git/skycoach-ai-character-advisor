# Multi-stage build so the server can build straight from a git checkout
# (`git pull` + `docker compose up -d --build`) with no local artifacts.
# Build context = repo root (see deploy/docker-compose.yml).

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 DEMO_MODE=0
# Next.js standalone output (self-contained server + minimal node_modules).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
