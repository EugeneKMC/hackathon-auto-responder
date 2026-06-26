# Bun runtime image so Bun.serve / Bun.password work on Render (whose native
# runtime is Node). Render injects PORT; the app reads it via env.PORT and
# Bun.serve binds 0.0.0.0 by default.
FROM oven/bun:1

WORKDIR /app

# Install deps first for better layer caching.
COPY package.json bun.lock* ./
RUN bun install

COPY . .

ENV NODE_ENV=production

CMD ["bun", "run", "src/server.ts"]
