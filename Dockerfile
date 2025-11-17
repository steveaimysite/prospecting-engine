FROM node:22-slim

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files AND patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Create startup script
RUN echo '#!/bin/sh\nset -e\necho "Running database migrations..."\npnpm db:push || { echo "Migration failed!"; exit 1; }\necho "Starting server..."\npnpm start' > /app/start.sh && chmod +x /app/start.sh

# Start command
CMD ["/app/start.sh"]
