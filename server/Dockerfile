# Use Bun runtime
FROM oven/bun:1-alpine AS base

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Create nodejs group and add existing bun user to it
RUN addgroup -g 1001 -S nodejs && \
    adduser bun nodejs

# Set ownership (using existing bun user from frontend)
RUN chown -R bun:nodejs /app

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:4000/health || exit 1

# Production stage
FROM base AS production

# Switch to bun user
USER bun

# Start application
CMD ["bun", "run", "start"]
