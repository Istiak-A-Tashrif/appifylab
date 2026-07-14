FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate

FROM dependencies AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]

FROM dependencies AS builder
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
USER nestjs
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
