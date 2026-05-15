FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/playwright-spider/package.json ./services/playwright-spider/package.json

# Optional future shared packages
# COPY packages/shared-events/package.json ./packages/shared-events/package.json

# Install dependencies
RUN pnpm install --filter playwright-spider --frozen-lockfile

# Copy actual source code
COPY . .

WORKDIR /app/services/playwright-spider

EXPOSE 3000

CMD ["pnpm", "dev"]
