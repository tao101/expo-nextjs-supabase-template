FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@10

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy package.json files
COPY apps/web-app/package.json ./apps/web-app/
COPY shared/package.json ./shared/

# Install dependencies
RUN pnpm install

# Copy the rest of the application
COPY . .

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN cd apps/web-app && pnpm install && pnpm build

# Expose the port
EXPOSE 3000

# Start the application
CMD cd apps/web-app && pnpm start