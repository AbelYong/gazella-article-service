FROM node:24-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runner-base

RUN addgroup -S article_service \
    && adduser -S article_service -G article_service
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=builder /app/dist ./dist
USER article_service
EXPOSE 7000

FROM runner-base AS development

ENV NODE_ENV=development
COPY --from=builder --chown=article_service:article_service /app/src ./src
CMD ["node", "dist/index.js"]

FROM runner-base AS production

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
