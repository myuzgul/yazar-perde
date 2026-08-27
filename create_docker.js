const fs = require('fs');
const path = require('path');

// Dockerfile
const dockerfile = `FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
`;
fs.writeFileSync(path.join(process.cwd(), 'Dockerfile'), dockerfile);

// docker-compose.yml
const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    environment:
      - DATABASE_URL=postgresql://perde_user:perde_secure_pass_2026@postgres:5432/perde_db?schema=public
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=production_super_secret_jwt_key_2026
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    ports:
      - "3000:3000"

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: perde_user
      POSTGRES_PASSWORD: perde_secure_pass_2026
      POSTGRES_DB: perde_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"

volumes:
  pgdata:
  redisdata:
`;
fs.writeFileSync(path.join(process.cwd(), 'docker-compose.yml'), dockerCompose);

console.log('Production Docker files generated.');
