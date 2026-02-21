# ── Stage 1: Build ──────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install all deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────
FROM node:20-alpine AS serve

WORKDIR /app

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built SPA + server
COPY --from=build /app/dist ./dist
COPY server.js ./

# Jobs directory will be mounted as a volume
RUN mkdir -p /app/jobs

EXPOSE 3000

ENV PORT=3000
ENV JOBS_DIR=/app/jobs

CMD ["node", "server.js"]
