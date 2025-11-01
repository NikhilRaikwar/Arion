# ChainBot - AI Web3 Assistant
# Multi-stage Docker build for production deployment

# Use Node.js 24 slim for smaller image size
FROM node:24-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm ci --omit=dev

# Build stage - compile the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables (required for Next.js static generation)
# These MUST be provided during docker build using --build-arg
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_ALCHEMY_API_KEY
ENV NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID
ENV NEXT_PUBLIC_ALCHEMY_API_KEY=$NEXT_PUBLIC_ALCHEMY_API_KEY

# Install all dependencies (including devDependencies for build)
RUN npm install

# Build the Next.js application
RUN npm run build

# Production image - final stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose port 3000 for the application
EXPOSE 3000

# Set port environment variable
ENV PORT=3000

# Start the Next.js production server
# Runtime environment variables should be passed via -e flags when running the container
CMD ["npm", "start"] 