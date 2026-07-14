FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM dependencies AS builder
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG API_PROXY_TARGET=http://localhost:3000
ARG NEXT_PUBLIC_CLOUD_NAME
ARG NEXT_PUBLIC_UPLOAD_PRESET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_PROXY_TARGET=$API_PROXY_TARGET
ENV NEXT_PUBLIC_CLOUD_NAME=$NEXT_PUBLIC_CLOUD_NAME
ENV NEXT_PUBLIC_UPLOAD_PRESET=$NEXT_PUBLIC_UPLOAD_PRESET
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production PORT=5173 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 5173
CMD ["node", "server.js"]
