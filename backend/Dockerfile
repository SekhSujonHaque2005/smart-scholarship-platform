# Use Node.js 20 Alpine for a lightweight production image
FROM node:20-alpine AS base

# Install Python and build essentials for the Scraper
RUN apk add --no-cache python3 py3-pip build-base

# Step 1: Install Node.js dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Step 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate

# Step 3: Production runner
FROM base AS runner
WORKDIR /app

# Re-install Python in the runner stage
RUN apk add --no-cache python3 py3-pip

ENV NODE_ENV production
ENV PORT 5000

# Copy Node.js files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Copy Scraper files
COPY --from=builder /app/scraper_service ./scraper_service

# Install Python dependencies for the Scraper
RUN pip install --no-cache-dir -r ./scraper_service/requirements.txt --break-system-packages

# Expose backend port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]
