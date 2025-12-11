FROM node:20-slim AS base
WORKDIR /app

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Copier les manifestes
COPY package.json pnpm-lock.yaml ./

# Installation production (respect .npmrc si besoin)
RUN pnpm install --frozen-lockfile

# Copier le reste du code
COPY . .

# Build TypeScript
RUN pnpm run build

# Runtime
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copier node_modules et dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY package.json ./

# Lancer le bot
CMD ["node", "dist/index.js"]

