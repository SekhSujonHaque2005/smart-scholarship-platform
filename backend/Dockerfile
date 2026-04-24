# Use Node.js 20 Alpine for a lightweight production image
FROM node:20-alpine AS base

# Step 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Step 2: Build the application (if needed, currently JS based)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If using Prisma, generate client
RUN npx prisma generate

# Step 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 5000

# Copy necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Expose backend port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]
