FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

RUN npm install -g pnpm@11.2.2

RUN pnpm config set store-dir /pnpm-store

COPY package.json pnpm-workspace.yaml ./
COPY services/playwright-spider/package.json ./services/playwright-spider/package.json

# Optional future shared packages
COPY packages/types/package.json ./packages/types/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

# Install dependencies
RUN pnpm install --filter playwright-spider

# Copy actual source code
COPY . .

WORKDIR /app/services/playwright-spider

EXPOSE 3000

CMD ["pnpm", "dev"]
